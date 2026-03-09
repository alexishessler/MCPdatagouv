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
      // Continue without tools if MCP server is unavailable
      mistralTools = [];
    }

    // ── Build Mistral messages ──
    const mistral = new Mistral({ apiKey });
    const model = process.env.MISTRAL_MODEL || 'mistral-small-latest';

    const mistralMessages: Array<Record<string, unknown>> = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-10), // Keep last 10 messages for context window
    ];

    // ── First Mistral call ──
    const chatOptions: Record<string, unknown> = {
      model,
      messages: mistralMessages,
    };

    if (mistralTools.length > 0) {
      chatOptions.tools = mistralTools;
      chatOptions.toolChoice = 'auto';
    }

    let response = await mistral.chat.complete(chatOptions as Parameters<typeof mistral.chat.complete>[0]);
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

      // Add assistant message with tool calls
      mistralMessages.push({
        role: 'assistant',
        content: choice.message.content || '',
        tool_calls: choice.message.toolCalls,
      });

      // Execute each tool call via MCP
      for (const toolCall of choice.message.toolCalls) {
        const fnName = toolCall.function.name;
        const fnArgs =
          typeof toolCall.function.arguments === 'string'
            ? JSON.parse(toolCall.function.arguments)
            : toolCall.function.arguments;

        let result: unknown;
        try {
          result = await callMCPTool(mcpClient, fnName, fnArgs);
        } catch (toolError) {
          console.error(`MCP tool error (${fnName}):`, toolError);
          result = {
            error: `Erreur lors de l'appel à ${fnName}: ${
              toolError instanceof Error ? toolError.message : 'Erreur inconnue'
            }`,
          };
        }

        toolResults.push({
          name: fnName,
          displayName: getToolDisplayName(fnName),
          data: result,
        });

        mistralMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: fnName,
          content:
            typeof result === 'string' ? result : JSON.stringify(result),
        });
      }

      // Call Mistral again with tool results
      response = await mistral.chat.complete({
        model,
        messages: mistralMessages as Parameters<typeof mistral.chat.complete>[0]['messages'],
        tools: mistralTools as Parameters<typeof mistral.chat.complete>[0]['tools'],
        toolChoice: 'auto',
      });

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
        // Ignore close errors
      }
    }

    // ── Return response ──
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
