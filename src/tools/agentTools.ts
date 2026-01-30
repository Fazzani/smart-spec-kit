/**
 * Agent Tools
 * 
 * MCP tools for interacting with agent system prompts
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AgentRegistry, getAgent, listAgents, type AgentType } from "../prompts/agents.js";

/**
 * Register agent-related tools on the MCP server
 */
export function registerAgentTools(server: McpServer): void {
  
  // Tool: list_agents - List all available agents
  server.tool(
    "list_agents",
    "List all available AI agents and their capabilities. Use this to understand which agent to use for a specific task.",
    {},
    async () => {
      const agents = listAgents();
      const formatted = agents.map((agent) => {
        const full = AgentRegistry[agent.name];
        return {
          name: agent.name,
          displayName: agent.displayName,
          description: agent.description,
          capabilities: full.capabilities,
        };
      });

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
    "Retrieve the full system prompt for a specific agent. Use this to understand how an agent behaves and its guidelines.",
    {
      agent_name: z.enum(["SpecAgent", "PlanAgent", "GovAgent", "TestAgent"])
        .describe("Name of the agent to get prompt for"),
    },
    async ({ agent_name }) => {
      try {
        const agent = getAgent(agent_name as AgentType);

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
    "Prepare an agent context for a specific task. Returns the agent's system prompt combined with task instructions.",
    {
      agent_name: z.enum(["SpecAgent", "PlanAgent", "GovAgent", "TestAgent"])
        .describe("Name of the agent to invoke"),
      task_description: z.string()
        .describe("Description of the task for the agent to perform"),
      context: z.string().optional()
        .describe("Additional context or data for the agent (e.g., work item details)"),
    },
    async ({ agent_name, task_description, context }) => {
      try {
        const agent = getAgent(agent_name as AgentType);

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
