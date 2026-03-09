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

const SYSTEM_PROMPT = `Tu es l'assistant MCP DataGouv Explorer. Tu explores les données ouvertes françaises via le serveur MCP de data.gouv.fr.

## Tes capacités (outils MCP)
- search_datasets : rechercher des jeux de données par mots-clés
- get_dataset_info : obtenir les détails d'un dataset spécifique
- list_dataset_resources : lister les fichiers d'un dataset
- query_resource_data : interroger des données tabulaires (CSV, Excel)
- search_dataservices : chercher des APIs publiques

## Stratégie de recherche (TRÈS IMPORTANT)
- Le moteur de recherche data.gouv.fr est LITTÉRAL — il ne comprend pas les synonymes
- Utilise des MOTS-CLÉS SIMPLES et COURTS : "climat" au lieu de "réchauffement climatique", "transport" au lieu de "transports en commun"
- Si peu de résultats, fais une 2e recherche avec des synonymes ou mots-clés alternatifs
- Exemples : "pollution air" → essayer aussi "qualité air", "émissions CO2" → essayer "carbone", "logement" → essayer aussi "immobilier"

## Règles de présentation
1. Réponds TOUJOURS en français
2. **Synthétise** les résultats — ne les recopie JAMAIS en entier
3. Présente : titre, organisation, nb de ressources, lien data.gouv.fr
4. Utilise du Markdown clair : ## titres, listes, **gras**
5. Propose d'explorer un dataset précis si plusieurs résultats
6. Sois concis et utile — pas de blabla
7. N'invente JAMAIS de résultats`;

const MAX_TOOL_RESULT_CHARS = 6000;

/**
 * Extract readable text from an MCP CallToolResult.
 * MCP returns { content: [{ type: "text", text: "..." }, ...] }
 * Truncates to MAX_TOOL_RESULT_CHARS to avoid overwhelming the LLM.
 */
function extractMCPText(result: unknown): string {
  let text: string;
  if (typeof result === 'string') {
    text = result;
  } else if (result && typeof result === 'object') {
    const obj = result as Record<string, unknown>;
    if (Array.isArray(obj.content)) {
      text = obj.content
        .filter((c: Record<string, unknown>) => c.type === 'text')
        .map((c: Record<string, unknown>) => c.text)
        .join('\n');
    } else {
      text = JSON.stringify(result);
    }
  } else {
    text = JSON.stringify(result);
  }

  if (text.length > MAX_TOOL_RESULT_CHARS) {
    return text.slice(0, MAX_TOOL_RESULT_CHARS) + '\n\n[... résultats tronqués — utilise get_dataset_info pour plus de détails sur un dataset spécifique]';
  }
  return text;
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
      console.log(`MCP connected — ${mcpTools.length} tools available:`, mcpTools.map(t => t.name));
      mistralTools = mcpToolsToMistralFormat(mcpTools);
    } catch (mcpError) {
      console.error('MCP connection failed:', mcpError);
    }

    // ── Build Mistral messages (only role + content from history) ──
    const mistral = new Mistral({ apiKey });
    const model = process.env.MISTRAL_MODEL || 'mistral-large-latest';

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
          console.log(`Calling MCP tool: ${fnName}`, fnArgs);
          const mcpResult = await callMCPTool(mcpClient, fnName, fnArgs);
          resultText = extractMCPText(mcpResult);
          console.log(`MCP result for ${fnName}: ${resultText.length} chars`);
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
