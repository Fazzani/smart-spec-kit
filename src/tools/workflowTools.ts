/**
 * Workflow Tools
 * 
 * MCP tools for managing and executing workflows
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  listWorkflows,
  loadWorkflow,
  loadWorkflowWithTemplate,
  getNextStep,
  type Workflow,
} from "../utils/workflowLoader.js";

/**
 * Format a workflow step as instructions for Copilot
 */
function formatStepInstructions(
  workflow: Workflow,
  stepIndex: number,
  contextId: string,
  template?: string
): string {
  const step = workflow.steps[stepIndex];
  if (!step) {
    return `✅ Workflow "${workflow.displayName}" completed for context: ${contextId}`;
  }

  const totalSteps = workflow.steps.length;
  const progress = `[Step ${stepIndex + 1}/${totalSteps}]`;
  
  let instructions = `
## 🔄 Workflow: ${workflow.displayName}
### ${progress} ${step.name}

**Context ID:** \`${contextId}\`
**Agent:** ${step.agent ?? workflow.defaultAgent}

---

### 📋 Instructions

${step.description}

`;

  // Add action-specific guidance
  switch (step.action) {
    case "fetch_ado":
      instructions += `
### 🔧 Action Required: Fetch from Azure DevOps

Use the **Azure DevOps MCP server** to retrieve the work item:

\`\`\`
Call: azure-devops → get_work_item
Parameters: { "id": "${contextId}" }
\`\`\`

After fetching, proceed with the next step.
`;
      break;

    case "generate_content":
      instructions += `
### 🔧 Action Required: Generate Content

Use the fetched data to generate the specification content.
${template ? "\n**Template structure to follow:**\n\n```markdown\n" + template.slice(0, 500) + "\n...\n```\n" : ""}

Fill in the sections based on the Azure DevOps work item data.
Mark sections requiring human input with \`[TO FILL]\`.
`;
      break;

    case "review":
      instructions += `
### 🔧 Action Required: Review

Review the generated content for:
- Completeness
- Technical accuracy  
- Alignment with requirements

Suggest improvements if needed.
`;
      break;

    case "create_file":
      instructions += `
### 🔧 Action Required: Create File

Create the specification file with the generated content.
Suggested filename: \`specs/${contextId}-spec.md\`
`;
      break;

    case "call_agent":
      instructions += `
### 🔧 Action Required: Call Agent

Invoke the **${step.agent ?? workflow.defaultAgent}** agent for specialized processing.
`;
      break;
  }

  // Add inputs if defined
  if (step.inputs && Object.keys(step.inputs).length > 0) {
    instructions += `
### 📥 Inputs
${Object.entries(step.inputs).map(([k, v]) => `- **${k}:** ${v}`).join("\n")}
`;
  }

  // Add expected outputs if defined
  if (step.outputs && step.outputs.length > 0) {
    instructions += `
### 📤 Expected Outputs
${step.outputs.map((o: string) => `- ${o}`).join("\n")}
`;
  }

  // Navigation hint
  const nextStep = getNextStep(workflow, step.id);
  if (nextStep) {
    instructions += `
---
⏭️ **Next Step:** ${nextStep.name}
When ready, call \`advance_workflow\` with step_id: \`${nextStep.id}\`
`;
  } else {
    instructions += `
---
✅ **This is the final step.** Complete the action to finish the workflow.
`;
  }

  return instructions;
}

/**
 * Register workflow-related tools on the MCP server
 */
export function registerWorkflowTools(server: McpServer): void {
  
  // Tool: list_workflows - List all available workflows
  server.tool(
    "list_workflows",
    "List all available workflow definitions. Use this to discover what workflows can be started.",
    {},
    async () => {
      const workflows = await listWorkflows();
      
      if (workflows.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: "No workflows found. Create YAML files in the /workflows directory.",
          }],
        };
      }

      // Load details for each workflow
      const details = await Promise.all(
        workflows.map(async (name) => {
          try {
            const wf = await loadWorkflow(name);
            return {
              name,
              displayName: wf.displayName,
              description: wf.description,
              steps: wf.steps.length,
              template: wf.template,
            };
          } catch {
            return { name, error: "Failed to load" };
          }
        })
      );

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ workflows: details }, null, 2),
        }],
      };
    }
  );

  // Tool: start_workflow - Start a workflow execution
  server.tool(
    "start_workflow",
    "Start a new workflow execution. Returns structured instructions for the first step.",
    {
      workflow_name: z.string().describe("Name of the workflow to start (e.g., 'feature-standard')"),
      context_id: z.string().describe("Context identifier, typically the Azure DevOps Work Item ID"),
    },
    async ({ workflow_name, context_id }) => {
      try {
        const { workflow, template } = await loadWorkflowWithTemplate(workflow_name);
        const instructions = formatStepInstructions(workflow, 0, context_id, template);

        return {
          content: [{
            type: "text" as const,
            text: instructions,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Error starting workflow: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: advance_workflow - Move to the next step
  server.tool(
    "advance_workflow",
    "Advance to a specific step in the workflow. Use after completing the current step.",
    {
      workflow_name: z.string().describe("Name of the active workflow"),
      context_id: z.string().describe("Context identifier (Work Item ID)"),
      step_id: z.string().describe("ID of the step to advance to"),
    },
    async ({ workflow_name, context_id, step_id }) => {
      try {
        const { workflow, template } = await loadWorkflowWithTemplate(workflow_name);
        const stepIndex = workflow.steps.findIndex((s) => s.id === step_id);

        if (stepIndex === -1) {
          const validIds = workflow.steps.map((s) => s.id).join(", ");
          throw new Error(`Step "${step_id}" not found. Valid step IDs: ${validIds}`);
        }

        const instructions = formatStepInstructions(workflow, stepIndex, context_id, template);

        return {
          content: [{
            type: "text" as const,
            text: instructions,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Error advancing workflow: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: get_template - Get a raw template content
  server.tool(
    "get_template",
    "Retrieve the raw content of a specification template.",
    {
      workflow_name: z.string().describe("Name of the workflow to get template for"),
    },
    async ({ workflow_name }) => {
      try {
        const { workflow, template } = await loadWorkflowWithTemplate(workflow_name);

        return {
          content: [{
            type: "text" as const,
            text: `# Template: ${workflow.template}\n\n${template}`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Error loading template: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );
}
