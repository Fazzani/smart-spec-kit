#!/usr/bin/env node
/**
 * Spec-Kit MCP Server
 * 
 * A custom MCP server for AI-driven specification engineering.
 * Orchestrates workflows, templates, and system prompts for GitHub Copilot.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { registerWorkflowTools } from "./tools/workflowTools.js";
import { registerAgentTools } from "./tools/agentTools.js";

// Server metadata
const SERVER_NAME = "spec-kit-mcp";
const SERVER_VERSION = "1.0.0";

/**
 * Initialize and configure the MCP Server
 */
function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Register tools
  registerTools(server);
  registerWorkflowTools(server);
  registerAgentTools(server);

  return server;
}

/**
 * Register all MCP tools
 */
function registerTools(server: McpServer): void {
  // Tool: ping - Health check / connectivity test
  server.tool(
    "ping",
    "Test tool to verify the Spec-Kit MCP server is running and responsive. Returns server info and timestamp.",
    {
      message: z.string().optional().describe("Optional message to echo back"),
    },
    async ({ message }) => {
      const response = {
        status: "ok",
        server: SERVER_NAME,
        version: SERVER_VERSION,
        timestamp: new Date().toISOString(),
        echo: message ?? null,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }
  );

  // Tool: get_server_info - Returns detailed server capabilities
  server.tool(
    "get_server_info",
    "Returns detailed information about the Spec-Kit MCP server capabilities and available workflows.",
    {},
    async () => {
      const info = {
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: "AI-driven specification platform for VS Code & GitHub Copilot",
        capabilities: {
          workflows: ["feature-standard", "bugfix", "technical-spec"],
          templates: ["functional-spec", "technical-spec", "test-plan"],
          agents: ["SpecAgent", "PlanAgent", "GovAgent"],
        },
        status: "ready",
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    }
  );
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP protocol)
  console.error(`[${SERVER_NAME}] Server started successfully (v${SERVER_VERSION})`);
}

// Run the server
main().catch((error) => {
  console.error("[spec-kit-mcp] Fatal error:", error);
  process.exit(1);
});
