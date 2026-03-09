import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL || 'https://mcp.data.gouv.fr/mcp';

/**
 * Creates a fresh MCP client connected to the data.gouv.fr MCP server.
 * Each call creates a new connection — designed for serverless environments
 * where persistent connections aren't reliable.
 */
export async function createMCPClient(): Promise<Client> {
  const transport = new StreamableHTTPClientTransport(
    new URL(MCP_SERVER_URL)
  );

  const client = new Client({
    name: 'mcp-datagouv-explorer',
    version: '1.0.0',
  });

  await client.connect(transport);
  return client;
}

/**
 * Lists available tools from the MCP server.
 */
export async function listMCPTools(
  client: Client
): Promise<Tool[]> {
  const { tools } = await client.listTools();
  return tools;
}

/**
 * Calls a tool on the MCP server and returns the result.
 */
export async function callMCPTool(
  client: Client,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const result = await client.callTool({ name, arguments: args });
  return result;
}

/**
 * Converts MCP tools to Mistral function-calling format.
 * MCP schema uses `inputSchema`, Mistral uses `parameters`.
 */
export function mcpToolsToMistralFormat(
  mcpTools: Tool[]
): Array<{
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}> {
  return mcpTools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description || '',
      parameters: (tool.inputSchema as Record<string, unknown>) || {
        type: 'object',
        properties: {},
      },
    },
  }));
}

/**
 * Human-readable names for MCP tools (French).
 */
export function getToolDisplayName(name: string): string {
  const names: Record<string, string> = {
    search_datasets: '🔍 Recherche de jeux de données',
    get_dataset_info: '📋 Détails du jeu de données',
    list_dataset_resources: '📁 Liste des ressources',
    get_resource_info: '📄 Détails de la ressource',
    query_resource_data: '🔎 Interrogation des données',
    search_dataservices: '🔌 Recherche d\'APIs',
    get_dataservice_info: '🔌 Détails de l\'API',
    get_dataservice_openapi_spec: '📖 Spécification OpenAPI',
    get_metrics: '📊 Métriques',
  };
  return names[name] || `🔧 ${name}`;
}
