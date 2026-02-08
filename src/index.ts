#!/usr/bin/env node
/**
 * Spec-Kit MCP Server v2.0
 * 
 * An automated workflow orchestration server for AI-driven specification engineering.
 * Guides GitHub Copilot through multi-step workflows automatically.
 * 
 * Architecture:
 * - Session Manager: Tracks workflow state across calls
 * - Workflow Engine: Orchestrates step execution
 * - Orchestration Tools: MCP interface for Copilot
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { registerOrchestrationTools } from "./tools/orchestrationTools.js";
import { registerPromptTools } from "./tools/promptTools.js";
import { registerMcpAppsTools } from "./tools/mcpAppsTools.js";
import { sessionStore } from "./engine/sessionManager.js";

// Server metadata
const SERVER_NAME = "spec-kit";
const SERVER_VERSION = "2.0.0";

/**
 * Initialize and configure the MCP Server
 */
function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Register tools
  registerCoreTools(server);
  registerOrchestrationTools(server);
  registerPromptTools(server);
  registerMcpAppsTools(server);

  return server;
}

/**
 * Register core utility tools
 */
function registerCoreTools(server: McpServer): void {
  // Tool: ping - Health check
  server.tool(
    "ping",
    "Vérifie que le serveur Spec-Kit est opérationnel.",
    {
      message: z.string().optional().describe("Message optionnel à renvoyer"),
    },
    async ({ message }) => {
      const activeSession = sessionStore.getActiveSession();
      
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            status: "ok",
            server: SERVER_NAME,
            version: SERVER_VERSION,
            timestamp: new Date().toISOString(),
            activeSession: activeSession?.sessionId ?? null,
            echo: message ?? null,
          }, null, 2),
        }],
      };
    }
  );

  // Tool: help - Show available commands
  server.tool(
    "help",
    "Affiche l'aide et les commandes disponibles.",
    {},
    async () => {
      return {
        content: [{
          type: "text" as const,
          text: `
# 🚀 Spec-Kit MCP Server v${SERVER_VERSION}

## Commandes Principales

### Démarrer un workflow
\`\`\`
start_workflow workflow_name="feature-standard" context_id="12345"
\`\`\`

### Continuer l'exécution
\`\`\`
execute_step previous_output="[résultat de l'étape précédente]"
\`\`\`

### Voir le statut
\`\`\`
workflow_status
\`\`\`

### Lister les workflows
\`\`\`
list_workflows
\`\`\`

## Workflows Disponibles

- **feature-standard** - Spécification fonctionnelle (5 étapes)
- **feature-full** - Spec complète avec gouvernance (10 étapes)  
- **bugfix** - Correction de bug (5 étapes)

## Mode d'emploi

1. Démarrez un workflow avec l'ID du work item Azure DevOps
2. Le serveur guide automatiquement chaque étape
3. Validez chaque action proposée
4. Les artefacts sont générés automatiquement
          `.trim(),
        }],
      };
    }
  );
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  // Initialize session store
  await sessionStore.init();
  
  const server = createServer();
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP protocol)
  console.error(`[${SERVER_NAME}] Server v${SERVER_VERSION} started - Automated orchestration ready`);
}

// Run the server
main().catch((error: unknown) => {
  console.error("[spec-kit] Fatal error:", error);
  process.exit(1);
});
