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
  template?: string,
  autoMode = false
): string {
  const step = workflow.steps[stepIndex];
  if (!step) {
    return `
# ✅ Workflow Completed

**Workflow:** ${workflow.displayName}
**Context:** ${contextId}

All steps have been completed successfully.

## Next Actions
- Review the generated outputs
- Call \`speckit: memory auto\` to save learnings
- Commit your changes
`;
  }

  const totalSteps = workflow.steps.length;
  const progressBar = workflow.steps.map((s, i) => 
    i < stepIndex ? "✅" : i === stepIndex ? "🔄" : "⬜"
  ).join(" ");
  
  let instructions = `
# 🔄 Workflow: ${workflow.displayName}

## Progress
${progressBar}
**Step ${stepIndex + 1} of ${totalSteps}:** ${step.name}
${autoMode ? "**Mode:** 🤖 AUTO (proceeding without approval)" : ""}

---

## 📋 Current Step: ${step.name}

**Context:** \`${contextId}\`
**Agent:** ${step.agent ?? workflow.defaultAgent}

### Instructions

${step.description}

`;

  // Add action-specific guidance
  switch (step.action) {
    case "fetch_ado":
      instructions += `
### 🔧 Action: Fetch from Azure DevOps

Use the Azure DevOps MCP server to retrieve work item \`${contextId}\`.
`;
      break;

    case "generate_content":
      instructions += `
### 🔧 Action: Generate Content

Generate the required content based on previous step outputs.
${template ? "\n**Template:**\n```markdown\n" + template.slice(0, 300) + "\n...\n```\n" : ""}
`;
      break;

    case "review":
      instructions += `
### 🔧 Action: Review

Review the generated content for completeness and accuracy.
`;
      break;

    case "call_agent":
      instructions += `
### 🔧 Action: Execute

Perform the described action using your capabilities.
`;
      break;
  }

  // Add expected outputs if defined
  if (step.outputs && step.outputs.length > 0) {
    instructions += `
### 📤 Expected Outputs
${step.outputs.map((o: string) => `- ${o}`).join("\n")}
`;
  }

  // Navigation
  const nextStep = getNextStep(workflow, step.id);
  if (nextStep) {
    if (autoMode) {
      instructions += `
---

## ⏭️ AUTO MODE

When this step is complete, **immediately proceed** to the next step:
**Next:** ${nextStep.name}

Do not wait for user approval. Execute all steps sequentially.
`;
    } else {
      instructions += `
---

## ⏭️ Next Step

When complete, proceed to: **${nextStep.name}**
Call \`execute_step\` with step_id: \`${nextStep.id}\`

Or ask the user: "Step complete. Proceed to ${nextStep.name}?"
`;
    }
  } else {
    instructions += `
---

## ✅ Final Step

This is the last step. After completion:
1. Summarize what was done
2. Save learnings to memory (\`speckit: memory auto\`)
3. Suggest next actions
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
    "Start a new workflow execution. Returns structured instructions for the first step. Use auto=true for AUTO mode (no user approval between steps).",
    {
      workflow_name: z.string().describe("Name of the workflow to start (e.g., 'feature-standard', 'bugfix-quick')"),
      context_id: z.string().optional().describe("Context identifier (e.g., Work Item ID, feature name). Optional."),
      auto: z.boolean().optional().describe("AUTO mode: proceed through all steps without user approval. Default: false"),
    },
    async ({ workflow_name, context_id, auto }) => {
      try {
        const { workflow, template } = await loadWorkflowWithTemplate(workflow_name);
        const effectiveContextId = context_id || "current-context";
        const instructions = formatStepInstructions(workflow, 0, effectiveContextId, template, auto ?? false);

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
      context_id: z.string().optional().describe("Context identifier"),
      step_id: z.string().describe("ID of the step to advance to"),
      auto: z.boolean().optional().describe("AUTO mode: proceed through remaining steps without user approval"),
    },
    async ({ workflow_name, context_id, step_id, auto }) => {
      try {
        const { workflow, template } = await loadWorkflowWithTemplate(workflow_name);
        const stepIndex = workflow.steps.findIndex((s) => s.id === step_id);

        if (stepIndex === -1) {
          const validIds = workflow.steps.map((s) => s.id).join(", ");
          throw new Error(`Step "${step_id}" not found. Valid step IDs: ${validIds}`);
        }

        const effectiveContextId = context_id || "current-context";
        const instructions = formatStepInstructions(workflow, stepIndex, effectiveContextId, template, auto ?? false);

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
