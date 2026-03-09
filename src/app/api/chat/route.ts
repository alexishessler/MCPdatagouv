import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  createMCPClient,
  listMCPTools,
  callMCPTool,
  mcpToolsToMistralFormat,
  getToolDisplayName,
} from '@/lib/mcp-client';

const SYSTEM_PROMPT = `Tu es l'assistant MCP DataGouv Explorer, un chatbot intelligent spécialisé dans l'exploration des données ouvertes françaises via data.gouv.fr.

Tu es connecté au serveur MCP officiel de data.gouv.fr et tu peux :
- Rechercher des jeux de données par mots-clés
- Obtenir les détails et métadonnées d'un jeu de données
- Lister les ressources (fichiers) disponibles
- Interroger directement les données tabulaires (CSV, Excel)
- Rechercher des APIs et services de données
- Obtenir des statistiques de fréquentation

Tu réponds TOUJOURS en français. Quand tu présentes des résultats :
- Utilise des titres et du formatage Markdown clair
- Inclus les liens vers data.gouv.fr quand disponibles
- Mets en avant le nombre de ressources, la date de mise à jour, l'organisation
- Propose d'explorer plus en détail si pertinent
- Sois enthousiaste sur le potentiel des données ouvertes !

Si tu ne trouves pas ce que l'utilisateur cherche, suggère des termes de recherche alternatifs.`;

/**
 * Extract readable text from an MCP CallToolResult.
 * MCP returns { content: [{ type: "text", text: "..." }, ...] }
 */
function extractMCPText(result: unknown): string {
  if (typeof result === 'string') return result;
  if (result && typeof result === 'object') {
    const obj = result as Record<string, unknown>;
    if (Array.isArray(obj.content)) {
      return obj.content
        .filter((c: Record<string, unknown>) => c.type === 'text')
        .map((c: Record<string, unknown>) => c.text)
        .join('\n');
    }
  }
  return JSON.stringify(result);
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Mistral non configurée. Ajoutez MISTRAL_API_KEY dans .env.local' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages) || !sessionId) {
      return NextResponse.json(
        { error: 'Requête invalide' },
        { status: 400 }
      );
    }

    // ── Rate limiting ──
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const rateLimit = checkRateLimit(ip, sessionId);
    if (!rateLimit.allowed) {
      const errorMsg =
        rateLimit.reason === 'daily'
          ? "Quota gratuit épuisé pour aujourd'hui ! C'est Alexis qui paye 😅"
          : 'Limite de session atteinte (5 requêtes). Rafraîchissez la page pour une nouvelle session !';

      return NextResponse.json(
        {
          error: errorMsg,
          rateLimitInfo: {
            sessionRemaining: rateLimit.sessionRemaining,
            dailyRemaining: rateLimit.dailyRemaining,
          },
        },
        { status: 429 }
      );
    }

    // ── Connect to MCP server ──
    let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null;
    let mistralTools: ReturnType<typeof mcpToolsToMistralFormat> = [];
    try {
      mcpClient = await createMCPClient();
      const mcpTools = await listMCPTools(mcpClient);
      mistralTools = mcpToolsToMistralFormat(mcpTools);
    } catch (mcpError) {
      console.error('MCP connection failed:', mcpError);
    }

    // ── Build Mistral messages (only role + content from history) ──
    const mistral = new Mistral({ apiKey });
    const model = process.env.MISTRAL_MODEL || 'mistral-small-latest';

    // Only pass simple user/assistant messages from frontend history
    const historyMessages = messages.slice(-10).map((m: Record<string, string>) => ({
      role: m.role,
      content: m.content,
    }));

    const mistralMessages: Array<Record<string, unknown>> = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...historyMessages,
    ];

    // ── First Mistral call ──
    const callMistral = async (msgs: Array<Record<string, unknown>>) => {
      const opts: Record<string, unknown> = { model, messages: msgs };
      if (mistralTools.length > 0) {
        opts.tools = mistralTools;
        opts.toolChoice = 'auto';
      }
      return mistral.chat.complete(
        opts as Parameters<typeof mistral.chat.complete>[0]
      );
    };

    let response = await callMistral(mistralMessages);
    let choice = response.choices?.[0];

    if (!choice) {
      throw new Error('Pas de réponse de Mistral');
    }

    // ── Handle tool calls (up to 3 rounds) ──
    const toolResults: Array<{
      name: string;
      displayName: string;
      data: unknown;
    }> = [];

    let rounds = 0;
    while (
      choice.message.toolCalls &&
      choice.message.toolCalls.length > 0 &&
      rounds < 3 &&
      mcpClient
    ) {
      rounds++;

      // Add assistant message with its tool_calls exactly as Mistral returned them
      mistralMessages.push({
        role: 'assistant',
        content: choice.message.content || '',
        toolCalls: choice.message.toolCalls,
      });

      // Execute EVERY tool call and add a response for each
      for (const toolCall of choice.message.toolCalls) {
        const fnName = toolCall.function.name;
        let fnArgs: Record<string, unknown> = {};
        try {
          fnArgs =
            typeof toolCall.function.arguments === 'string'
              ? JSON.parse(toolCall.function.arguments)
              : (toolCall.function.arguments as Record<string, unknown>) || {};
        } catch {
          fnArgs = {};
        }

        let resultText: string;
        let resultData: unknown;
        try {
          const mcpResult = await callMCPTool(mcpClient, fnName, fnArgs);
          resultText = extractMCPText(mcpResult);
          resultData = mcpResult;
        } catch (toolError) {
          console.error(`MCP tool error (${fnName}):`, toolError);
          resultText = JSON.stringify({
            error: `Erreur: ${toolError instanceof Error ? toolError.message : 'inconnue'}`,
          });
          resultData = { error: resultText };
        }

        toolResults.push({
          name: fnName,
          displayName: getToolDisplayName(fnName),
          data: resultData,
        });

        // Tool response must match the tool call ID
        mistralMessages.push({
          role: 'tool',
          toolCallId: toolCall.id,
          name: fnName,
          content: resultText,
        });
      }

      // Call Mistral again with tool results
      response = await callMistral(mistralMessages);
      choice = response.choices?.[0];
      if (!choice) {
        throw new Error("Pas de réponse de Mistral après l'exécution des outils");
      }
    }

    // ── Cleanup MCP connection ──
    if (mcpClient) {
      try {
        await mcpClient.close();
      } catch {
        // Ignore
      }
    }

    return NextResponse.json({
      message:
        choice.message.content || "Je n'ai pas pu générer de réponse.",
      toolResults: toolResults.length > 0 ? toolResults : undefined,
      rateLimitInfo: {
        sessionRemaining: rateLimit.sessionRemaining,
        dailyRemaining: rateLimit.dailyRemaining,
      },
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const message =
      error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
