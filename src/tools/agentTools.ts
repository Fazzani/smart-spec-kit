/**
 * Agent Tools
 * 
 * MCP tools for interacting with agent system prompts.
 * Supports both built-in agents and custom agents from .spec-kit/agents/
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadAgent, listAgentsDetailed, type ExtendedAgentType } from "../utils/agentLoader.js";

/**
 * Register agent-related tools on the MCP server
 */
export function registerAgentTools(server: McpServer): void {
  
  // Tool: list_agents - List all available agents (built-in + custom)
  server.tool(
    "list_agents",
    "List all available AI agents and their capabilities. Includes both built-in agents and custom agents from .spec-kit/agents/.",
    {},
    async () => {
      const agents = await listAgentsDetailed();
      
      const formatted = agents.map((agent) => ({
        name: agent.name,
        displayName: agent.displayName,
        description: agent.description,
        capabilities: agent.capabilities,
        source: agent.source, // "local" or "builtin"
      }));

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ agents: formatted }, null, 2),
        }],
      };
    }
  );

  // Tool: get_agent_prompt - Get system prompt for an agent
  server.tool(
    "get_agent_prompt",
    "Retrieve the full system prompt for a specific agent. Supports built-in agents and custom agents from .spec-kit/agents/.",
    {
      agent_name: z.string()
        .describe("Name of the agent to get prompt for (e.g., SpecAgent, PlanAgent, or a custom agent name)"),
    },
    async ({ agent_name }) => {
      try {
        const agent = await loadAgent(agent_name as ExtendedAgentType);

        const response = `# Agent: ${agent.displayName}

## Description
${agent.description}

## Capabilities
${agent.capabilities.map((c) => `- ${c}`).join("\n")}

## System Prompt
\`\`\`
${agent.systemPrompt}
\`\`\`
`;

        return {
          content: [{
            type: "text" as const,
            text: response,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: invoke_agent - Get agent context for a specific task
  server.tool(
    "invoke_agent",
    "Prepare an agent context for a specific task. Returns the agent's system prompt combined with task instructions. Supports custom agents.",
    {
      agent_name: z.string()
        .describe("Name of the agent to invoke (e.g., SpecAgent, PlanAgent, or a custom agent name)"),
      task_description: z.string()
        .describe("Description of the task for the agent to perform"),
      context: z.string().optional()
        .describe("Additional context or data for the agent (e.g., work item details)"),
    },
    async ({ agent_name, task_description, context }) => {
      try {
        const agent = await loadAgent(agent_name as ExtendedAgentType);

        const response = `# 🤖 ${agent.displayName} Activated

## System Context
${agent.systemPrompt}

---

## Task Assignment

**Task:** ${task_description}

${context ? `## Provided Context\n\n${context}\n\n---` : ""}

## Instructions

You are now operating as **${agent.displayName}**. Follow the system context above to complete the assigned task.

Use your capabilities:
${agent.capabilities.map((c) => `- ${c}`).join("\n")}

Proceed with the task.
`;

        return {
          content: [{
            type: "text" as const,
            text: response,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );
}
