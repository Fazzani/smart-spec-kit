/**
 * Prompt Tools for Spec-Kit
 * 
 * MCP tools that load and execute customizable prompts from .spec-kit/prompts/
 * These tools are callable via natural language in Copilot Chat.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listWorkflowsDetailed, loadWorkflow } from "../utils/workflowLoader.js";

// Schema for prompt tool arguments
const SpecifyArgsSchema = z.object({
  requirements: z.string().optional().describe("The requirements to specify. Can be a feature description, user story, or Azure DevOps work item ID (e.g., #12345). If not provided, Copilot will ask the user."),
  contextId: z.string().optional().describe("Optional context ID for the specification (used for filename)."),
});

const PlanArgsSchema = z.object({
  specPath: z.string().optional().describe("Path to the specification file. If not provided, will look for the most recent spec."),
});

const TasksArgsSchema = z.object({
  planPath: z.string().optional().describe("Path to the plan file. If not provided, will look for the most recent plan."),
});

const ImplementArgsSchema = z.object({
  taskId: z.string().optional().describe("Optional specific task ID to implement. If not provided, implements the next pending task."),
});

const ClarifyArgsSchema = z.object({
  specPath: z.string().optional().describe("Path to the specification file to clarify."),
  questions: z.string().optional().describe("Specific questions or areas to clarify."),
});

const HelpArgsSchema = z.object({
  topic: z.string().optional().describe("The topic to get help on. Examples: 'workflows', 'templates', 'prompts', 'customization', 'troubleshooting'."),
});

const MemoryArgsSchema = z.object({
  action: z.enum(["add", "update", "list", "auto"]).optional().describe("Action: 'add' (add new memory file), 'update' (update existing), 'list' (show all memory files), 'auto' (auto-enrich from context). Default: 'add'"),
  fileName: z.string().optional().describe("Name of the memory file (without .md extension). Examples: 'decisions', 'architecture', 'conventions'"),
  content: z.string().optional().describe("Content to add or update in the memory file"),
  category: z.string().optional().describe("Category for organizing memory: 'decisions', 'architecture', 'conventions', 'learnings', 'context'. Default: inferred from fileName"),
});

const ValidateArgsSchema = z.object({
  ruleType: z.string().optional().describe("Type of validation: 'security', 'rgpd', 'architecture', or custom rule file name. Default: 'security'"),
  phase: z.enum(["spec", "plan", "implementation"]).optional().describe("Phase to validate: 'spec' (after specification), 'plan' (after planning), 'implementation' (after coding). Default: 'spec'"),
  targetPath: z.string().optional().describe("Path to the document or code to validate. Auto-detects if not provided."),
});

const WorkflowArgsSchema = z.object({
  action: z.enum(["list", "start", "status"]).optional().describe("Action: 'list' (show workflows), 'start' (start a workflow), 'status' (show current status). Default: 'list'"),
  workflowName: z.string().optional().describe("Name of the workflow to start (required for 'start' action). Examples: 'feature-standard', 'bugfix'"),
  contextId: z.string().optional().describe("Optional context identifier for the workflow (e.g., work item ID or feature name)"),
  auto: z.boolean().optional().describe("Auto mode - proceed through steps without approval (default: false)"),
});

const ConstitutionArgsSchema = z.object({
  principles: z.string().optional().describe("The principles or guidelines to add to the constitution. If not provided, Copilot will guide interactively."),
  projectName: z.string().optional().describe("The project name for the constitution header."),
});

const AnalyzeArgsSchema = z.object({
  focusArea: z.string().optional().describe("Optional focus area for analysis (e.g., 'security', 'coverage', 'consistency'). If not provided, performs full analysis."),
});

const ChecklistArgsSchema = z.object({
  checklistType: z.string().optional().describe("Type of checklist to generate: 'ux', 'api', 'security', 'performance', 'accessibility', or custom. Default: derived from context."),
  focusAreas: z.string().optional().describe("Specific areas to focus on in the checklist."),
});

/**
 * Load documentation from package
 */
async function loadDocumentation(): Promise<string> {
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  const normalizedDir = currentDir.replace(/^\/([A-Za-z]:)/, "$1");
  const packageRoot = path.resolve(normalizedDir, "..", "..");
  const docPath = path.join(packageRoot, "docs", "DOCUMENTATION.md");
  
  try {
    return await fs.readFile(docPath, "utf-8");
  } catch {
    return getBuiltInDocumentation();
  }
}

/**
 * Built-in documentation fallback
 */
function getBuiltInDocumentation(): string {
  return `# Spec-Kit Help

## Available Commands

All commands are conversational - parameters are optional. Just type the command and Copilot will guide you.

| Command | Description | Example |
|---------|-------------|---------|
| \`speckit: spec\` | Create a specification | \`speckit: spec pour un système de login\` |
| \`speckit: plan\` | Create implementation plan | \`speckit: plan\` |
| \`speckit: tasks\` | Generate task breakdown | \`speckit: tasks\` |
| \`speckit: implement\` | Implement tasks | \`speckit: implement\` or \`speckit: implement task 3\` |
| \`speckit: clarify\` | Clarify requirements | \`speckit: clarify\` |
| \`speckit: memory\` | Manage project memory | \`speckit: memory list\` or \`speckit: memory auto\` |
| \`speckit: workflow\` | Manage workflows | \`speckit: workflow list\` or \`speckit: workflow start feature-standard\` |
| \`speckit: help\` | Get help | \`speckit: help workflows\` |

## Workflows

Workflows are multi-step automated processes:

- \`speckit: workflow list\` - Show available workflows
- \`speckit: workflow start feature-standard\` - Start a workflow
- \`speckit: workflow status\` - Check current workflow status

Workflows guide you through specify → plan → tasks → implement with built-in checkpoints.

## Memory Management

The memory tool helps you enrich project context:

- \`speckit: memory list\` - Show all memory files
- \`speckit: memory add decisions\` - Add a new decision
- \`speckit: memory auto\` - Auto-enrich from conversation
- \`speckit: memory update conventions\` - Update conventions

## Quick Start

1. **Create a spec**: \`speckit: spec\` then describe what you want
2. **Plan it**: \`speckit: plan\`
3. **Break into tasks**: \`speckit: tasks\`
4. **Implement**: \`speckit: implement\`

## Project Structure

\`\`\`
.spec-kit/
├── prompts/      # Customizable prompts (read by MCP tools)
├── templates/    # Document templates (customize format)
├── memory/       # Project constitution (your principles)
└── workflows/    # YAML workflows (multi-step processes)
specs/            # Generated specifications (output)
\`\`\`

## Customization

### Modify Prompts
Edit files in \`.spec-kit/prompts/\` to change command behavior.

### Edit Templates
Modify \`.spec-kit/templates/\` for custom document formats.

### Create Workflows
Add YAML files to \`.spec-kit/workflows/\` for custom multi-step processes.

### Update Constitution
Edit \`.spec-kit/memory/constitution.md\` with your project principles (tech stack, conventions, etc.)

### Customize Agents
Agents are AI personas that guide specific tasks. Create custom agents in \`.spec-kit/agents/\`:

\`\`\`markdown
---
name: SecurityAgent
displayName: "Security Expert"
description: "Expert en sécurité applicative"
capabilities:
  - Identifier les vulnérabilités
  - OWASP Top 10
---

## System Prompt

Tu es SecurityAgent, expert en sécurité...
\`\`\`

Use in workflows: \`agent: SecurityAgent\`

Built-in agents: SpecAgent, PlanAgent, GovAgent, TestAgent

## Troubleshooting

1. Reload VS Code: Ctrl+Shift+P → "Developer: Reload Window"
2. Check MCP config in .vscode/settings.json
3. Run \`npx smart-spec-kit-mcp setup\` to reinstall
`;
}

/**
 * Load a prompt file from .spec-kit/prompts/
 */
async function loadPrompt(projectPath: string, promptName: string): Promise<string | null> {
  const promptPath = path.join(projectPath, ".spec-kit", "prompts", `${promptName}.md`);
  
  try {
    const content = await fs.readFile(promptPath, "utf-8");
    return content;
  } catch {
    // Try loading from package defaults
    return null;
  }
}

/**
 * Load project constitution from .spec-kit/memory/constitution.md
 */
async function loadConstitution(projectPath: string): Promise<string | null> {
  const constitutionPath = path.join(projectPath, ".spec-kit", "memory", "constitution.md");
  
  try {
    const content = await fs.readFile(constitutionPath, "utf-8");
    return content;
  } catch {
    return null;
  }
}

/**
 * Load a template from .spec-kit/templates/
 */
async function loadTemplate(projectPath: string, templateName: string): Promise<string | null> {
  const templatePath = path.join(projectPath, ".spec-kit", "templates", `${templateName}.md`);
  
  try {
    const content = await fs.readFile(templatePath, "utf-8");
    return content;
  } catch {
    return null;
  }
}

/**
 * Load validation rules from .spec-kit/rules/
 */
async function loadRules(projectPath: string, ruleType: string): Promise<string | null> {
  const rulesPath = path.join(projectPath, ".spec-kit", "rules", `${ruleType}-rules.md`);
  
  try {
    const content = await fs.readFile(rulesPath, "utf-8");
    return content;
  } catch {
    // Try without -rules suffix
    const altPath = path.join(projectPath, ".spec-kit", "rules", `${ruleType}.md`);
    try {
      return await fs.readFile(altPath, "utf-8");
    } catch {
      return null;
    }
  }
}

/**
 * List available rule files in .spec-kit/rules/
 */
async function listRules(projectPath: string): Promise<string[]> {
  const rulesDir = path.join(projectPath, ".spec-kit", "rules");
  
  try {
    const files = await fs.readdir(rulesDir);
    return files.filter(f => f.endsWith(".md")).map(f => f.replace(".md", "").replace("-rules", ""));
  } catch {
    return [];
  }
}

/**
 * Find the most recent file matching a pattern in specs/
 */
async function findRecentSpec(projectPath: string, pattern: string): Promise<string | null> {
  const specsDir = path.join(projectPath, "specs");
  
  try {
    const files = await fs.readdir(specsDir);
    const matchingFiles = files.filter(f => f.includes(pattern) && f.endsWith(".md"));
    
    if (matchingFiles.length === 0) return null;
    
    // Sort by modification time, most recent first
    const filesWithStats = await Promise.all(
      matchingFiles.map(async (file) => {
        const filePath = path.join(specsDir, file);
        const stats = await fs.stat(filePath);
        return { file, mtime: stats.mtime };
      })
    );
    
    filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    
    const mostRecent = filesWithStats[0];
    if (!mostRecent) return null;
    
    return path.join(specsDir, mostRecent.file);
  } catch {
    return null;
  }
}

/**
 * Check if spec-kit is properly set up in the project
 */
async function checkSetup(projectPath: string): Promise<{ ok: boolean; missing: string[] }> {
  const checks = [
    { path: path.join(projectPath, ".spec-kit", "prompts"), name: ".spec-kit/prompts" },
    { path: path.join(projectPath, ".spec-kit", "templates"), name: ".spec-kit/templates" },
    { path: path.join(projectPath, ".spec-kit", "memory", "constitution.md"), name: ".spec-kit/memory/constitution.md" },
  ];
  
  const missing: string[] = [];
  
  for (const check of checks) {
    try {
      await fs.access(check.path);
    } catch {
      missing.push(check.name);
    }
  }
  
  return { ok: missing.length === 0, missing };
}

/**
 * Build the full context for a prompt execution
 */
async function buildPromptContext(
  projectPath: string,
  promptName: string,
  userInput: string,
  additionalContext?: Record<string, string>
): Promise<string> {
  const parts: string[] = [];
  
  // 1. Load the prompt instructions
  const prompt = await loadPrompt(projectPath, promptName);
  if (prompt) {
    parts.push("## Prompt Instructions\n\n" + prompt);
  }
  
  // 2. Load project constitution
  const constitution = await loadConstitution(projectPath);
  if (constitution) {
    parts.push("## Project Constitution\n\n" + constitution);
  }
  
  // 3. Add user input
  parts.push("## User Input\n\n" + userInput);
  
  // 4. Add additional context if provided
  if (additionalContext) {
    for (const [key, value] of Object.entries(additionalContext)) {
      parts.push(`## ${key}\n\n${value}`);
    }
  }
  
  return parts.join("\n\n---\n\n");
}

/**
 * Register prompt tools with the MCP server
 */
export function registerPromptTools(server: McpServer): void {
  
  // speckit_specify - Create a functional specification
  server.tool(
    "speckit_specify",
    "Create a functional specification from requirements. Use this when the user wants to create a spec, document requirements, or says 'speckit: spec', 'speckit: specify', or 'créer une spec'. Requirements can be a description, user story, or optionally an Azure DevOps work item ID.",
    SpecifyArgsSchema.shape,
    async ({ requirements, contextId }) => {
      const projectPath = process.cwd();
      
      // Check setup
      const setup = await checkSetup(projectPath);
      if (!setup.ok) {
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ Spec-Kit Setup Required\n\nMissing: ${setup.missing.join(", ")}\n\nRun \`npx smart-spec-kit-mcp setup\` to initialize Spec-Kit in this project.`,
          }],
        };
      }
      
      // Load template
      const template = await loadTemplate(projectPath, "functional-spec");
      
      // Handle missing requirements - prompt user
      const userInput = requirements || "[User will provide requirements]";
      
      // Build context
      const context = await buildPromptContext(projectPath, "specify", userInput, {
        "Template": template || "No template found",
        "Context ID": contextId || "auto-generated",
      });
      
      return {
        content: [{
          type: "text" as const,
          text: `## 📋 Specification Creation

${requirements ? `**Requirements:** ${requirements}` : "**📝 Please describe what you want to build.**\n\nYou can provide:\n- A feature description (e.g., \"user authentication with email/password\")\n- A user story (e.g., \"As a user, I want to...\")\n- An Azure DevOps work item ID (e.g., \"#12345\") - optional"}
${contextId ? `**Context ID:** ${contextId}` : ""}

${context}

---

## Copilot Instructions

${requirements ? `Based on the prompt instructions and project constitution above:
1. Analyze the provided requirements
2. Fill in the functional specification template
3. Save the specification to \`specs/${contextId || "feature"}-spec.md\`
4. Report what was created and suggest next steps (speckit_plan)` : `The user hasn't provided requirements yet. Ask them to describe:
- What feature or functionality they want to build
- The user need or problem it solves
- Any constraints or requirements they have

Once they provide this information, proceed with specification creation.`}`,
        }],
      };
    }
  );
  
  // speckit_plan - Create an implementation plan
  server.tool(
    "speckit_plan",
    "Create a technical implementation plan from a specification. Use this when the user wants to plan implementation, or says 'speckit: plan', 'planifier', or 'créer un plan'.",
    PlanArgsSchema.shape,
    async ({ specPath }) => {
      const projectPath = process.cwd();
      
      // Check setup
      const setup = await checkSetup(projectPath);
      if (!setup.ok) {
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ Spec-Kit Setup Required\n\nMissing: ${setup.missing.join(", ")}\n\nRun \`npx smart-spec-kit-mcp setup\` to initialize Spec-Kit in this project.`,
          }],
        };
      }
      
      // Find specification
      let specContent = "";
      const resolvedSpecPath = specPath || await findRecentSpec(projectPath, "spec");
      
      if (resolvedSpecPath) {
        try {
          specContent = await fs.readFile(resolvedSpecPath, "utf-8");
        } catch {
          specContent = "Could not load specification file.";
        }
      }
      
      // Load template
      const template = await loadTemplate(projectPath, "plan-template");
      
      // Build context
      const context = await buildPromptContext(projectPath, "plan", specContent, {
        "Specification Path": resolvedSpecPath || "Not found",
        "Template": template || "No template found",
      });
      
      return {
        content: [{
          type: "text" as const,
          text: `## 📐 Implementation Plan Creation

${resolvedSpecPath ? `**Specification:** ${resolvedSpecPath}` : "**Warning:** No specification found. Please run speckit_specify first."}

${context}

---

## Copilot Instructions

Based on the prompt instructions, specification, and project constitution:
1. Analyze the specification
2. Create a technical implementation plan
3. Break down into phases and milestones
4. Save to \`specs/plan.md\`
5. Suggest next step (speckit_tasks)`,
        }],
      };
    }
  );
  
  // speckit_tasks - Generate task breakdown
  server.tool(
    "speckit_tasks",
    "Generate a detailed task breakdown from a plan. Use this when the user wants to create tasks, or says 'speckit: tasks', 'générer les tâches', or 'créer les tâches'.",
    TasksArgsSchema.shape,
    async ({ planPath }) => {
      const projectPath = process.cwd();
      
      // Check setup
      const setup = await checkSetup(projectPath);
      if (!setup.ok) {
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ Spec-Kit Setup Required\n\nMissing: ${setup.missing.join(", ")}\n\nRun \`npx smart-spec-kit-mcp setup\` to initialize Spec-Kit in this project.`,
          }],
        };
      }
      
      // Find plan
      let planContent = "";
      const resolvedPlanPath = planPath || await findRecentSpec(projectPath, "plan");
      
      if (resolvedPlanPath) {
        try {
          planContent = await fs.readFile(resolvedPlanPath, "utf-8");
        } catch {
          planContent = "Could not load plan file.";
        }
      }
      
      // Load template
      const template = await loadTemplate(projectPath, "tasks-template");
      
      // Build context
      const context = await buildPromptContext(projectPath, "tasks", planContent, {
        "Plan Path": resolvedPlanPath || "Not found",
        "Template": template || "No template found",
      });
      
      return {
        content: [{
          type: "text" as const,
          text: `## 📝 Task Breakdown Creation

${resolvedPlanPath ? `**Plan:** ${resolvedPlanPath}` : "**Warning:** No plan found. Please run speckit_plan first."}

${context}

---

## Copilot Instructions

Based on the prompt instructions, plan, and project constitution:
1. Analyze the implementation plan
2. Create atomic, actionable tasks
3. Add acceptance criteria to each task
4. Save to \`specs/tasks.md\`
5. Suggest next step (speckit_implement)`,
        }],
      };
    }
  );
  
  // speckit_implement - Start implementation
  server.tool(
    "speckit_implement",
    "Implement tasks from the task breakdown. Use this when the user wants to start coding, or says 'speckit: implement', 'implémenter', or 'coder'.",
    ImplementArgsSchema.shape,
    async ({ taskId }) => {
      const projectPath = process.cwd();
      
      // Check setup
      const setup = await checkSetup(projectPath);
      if (!setup.ok) {
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ Spec-Kit Setup Required\n\nMissing: ${setup.missing.join(", ")}\n\nRun \`npx smart-spec-kit-mcp setup\` to initialize Spec-Kit in this project.`,
          }],
        };
      }
      
      // Find tasks
      const tasksPath = await findRecentSpec(projectPath, "tasks");
      let tasksContent = "";
      
      if (tasksPath) {
        try {
          tasksContent = await fs.readFile(tasksPath, "utf-8");
        } catch {
          tasksContent = "Could not load tasks file.";
        }
      }
      
      // Find spec for context
      const specPath = await findRecentSpec(projectPath, "spec");
      let specContent = "";
      if (specPath) {
        try {
          specContent = await fs.readFile(specPath, "utf-8");
        } catch {
          specContent = "";
        }
      }
      
      // Build context
      const context = await buildPromptContext(projectPath, "implement", tasksContent, {
        "Task ID": taskId || "Next pending task",
        "Specification": specContent || "Not loaded",
      });
      
      return {
        content: [{
          type: "text" as const,
          text: `## 🚀 Implementation

${tasksPath ? `**Tasks:** ${tasksPath}` : "**Warning:** No tasks found. Please run speckit_tasks first."}
${taskId ? `**Target Task:** ${taskId}` : "**Target:** Next pending task"}

${context}

---

## Copilot Instructions

Based on the prompt instructions, tasks, specification, and project constitution:
1. Find the ${taskId ? `task ${taskId}` : "next pending task"}
2. Implement the code following project conventions
3. **⚠️ MANDATORY: Update tasks.md** - Change \`- [ ]\` to \`- [x]\` and add \`✅ Done (YYYY-MM-DD)\`
4. Report what was implemented
5. **Auto-enrich memory**: After implementation, automatically save learnings to \`.spec-kit/memory/\`:
   - Technical decisions made → \`decisions.md\`
   - New patterns/conventions used → \`conventions.md\`
   - Lessons learned → \`learnings.md\`
   
   Format each entry with date, context, and rationale.
6. Ask if user wants to continue with next task

**IMPORTANT: Task is NOT complete until tasks.md is updated!**`,
        }],
      };
    }
  );
  
  // speckit_clarify - Clarify requirements
  server.tool(
    "speckit_clarify",
    "Clarify ambiguous requirements in a specification. Use this when the user wants to clarify, or says 'speckit: clarify', 'clarifier', or 'préciser'.",
    ClarifyArgsSchema.shape,
    async ({ specPath, questions }) => {
      const projectPath = process.cwd();
      
      // Check setup
      const setup = await checkSetup(projectPath);
      if (!setup.ok) {
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ Spec-Kit Setup Required\n\nMissing: ${setup.missing.join(", ")}\n\nRun \`npx smart-spec-kit-mcp setup\` to initialize Spec-Kit in this project.`,
          }],
        };
      }
      
      // Find specification
      let specContent = "";
      const resolvedSpecPath = specPath || await findRecentSpec(projectPath, "spec");
      
      if (resolvedSpecPath) {
        try {
          specContent = await fs.readFile(resolvedSpecPath, "utf-8");
        } catch {
          specContent = "Could not load specification file.";
        }
      }
      
      // Build context
      const context = await buildPromptContext(projectPath, "clarify", specContent, {
        "Questions": questions || "Find all [NEEDS CLARIFICATION] markers",
      });
      
      return {
        content: [{
          type: "text" as const,
          text: `## 🔍 Requirements Clarification

${resolvedSpecPath ? `**Specification:** ${resolvedSpecPath}` : "**Warning:** No specification found."}

${context}

---

## Copilot Instructions

Based on the prompt instructions and specification:
1. Find all [NEEDS CLARIFICATION] markers
2. Ask targeted questions for each ambiguity
3. Update the specification with clarified requirements
4. Save the updated spec
5. Suggest next step if all clarifications resolved`,
        }],
      };
    }
  );
  
  // speckit_help - Get help and documentation
  server.tool(
    "speckit_help",
    "Get help on how to use Spec-Kit, customize it, create workflows, or troubleshoot issues. Use this when the user asks 'speckit: help', 'aide sur speckit', or has questions about Spec-Kit.",
    HelpArgsSchema.shape,
    async ({ topic }) => {
      const documentation = await loadDocumentation();
      
      // Extract relevant section if topic is provided
      let relevantDoc = documentation;
      if (topic) {
        const topicLower = topic.toLowerCase();
        const sections = documentation.split(/^## /gm);
        
        const relevantSections = sections.filter(section => {
          const sectionLower = section.toLowerCase();
          return sectionLower.includes(topicLower) ||
            (topicLower.includes("workflow") && sectionLower.includes("workflow")) ||
            (topicLower.includes("template") && sectionLower.includes("template")) ||
            (topicLower.includes("prompt") && sectionLower.includes("prompt")) ||
            (topicLower.includes("custom") && sectionLower.includes("custom")) ||
            (topicLower.includes("trouble") && sectionLower.includes("trouble")) ||
            (topicLower.includes("agent") && sectionLower.includes("agent")) ||
            (topicLower.includes("command") && sectionLower.includes("command")) ||
            (topicLower.includes("tool") && sectionLower.includes("tool"));
        });
        
        if (relevantSections.length > 0) {
          relevantDoc = relevantSections.map(s => "## " + s).join("\n");
        }
      }
      
      return {
        content: [{
          type: "text" as const,
          text: `## ❓ Spec-Kit Help

${topic ? `**Topic:** ${topic}` : "**General Help**"}

---

${relevantDoc}

---

## Need More Help?

- **Commands**: \`speckit: help commands\`
- **Customization**: \`speckit: help customization\`
- **Workflows**: \`speckit: help workflows\`
- **Templates**: \`speckit: help templates\`
- **Troubleshooting**: \`speckit: help troubleshooting\`

You can also ask specific questions like:
- "speckit: help comment créer un nouveau workflow ?"
- "speckit: help how to customize templates?"
- "speckit: help quels agents sont disponibles ?"`,
        }],
      };
    }
  );

  // speckit_memory - Manage project memory/context
  server.tool(
    "speckit_memory",
    "Manage project memory and context in .spec-kit/memory/. Use this to add learnings, decisions, conventions, or auto-enrich the project context. Triggers: 'speckit: memory', 'enrichir la mémoire', 'ajouter au contexte'.",
    MemoryArgsSchema.shape,
    async ({ action = "add", fileName, content, category }) => {
      const projectPath = process.cwd();
      const memoryDir = path.join(projectPath, ".spec-kit", "memory");
      
      // Check setup
      const setup = await checkSetup(projectPath);
      if (!setup.ok) {
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ Spec-Kit Setup Required\n\nMissing: ${setup.missing.join(", ")}\n\nRun \`npx smart-spec-kit-mcp setup\` to initialize Spec-Kit in this project.`,
          }],
        };
      }

      // Action: list - Show all memory files
      if (action === "list") {
        try {
          const files = await fs.readdir(memoryDir);
          const mdFiles = files.filter(f => f.endsWith(".md"));
          
          let fileList = "";
          for (const file of mdFiles) {
            const filePath = path.join(memoryDir, file);
            const stat = await fs.stat(filePath);
            const contentPreview = await fs.readFile(filePath, "utf-8");
            const lines = contentPreview.split("\n").slice(0, 3).join("\n");
            fileList += `### 📄 ${file}\n*Modified: ${stat.mtime.toLocaleDateString()}*\n\`\`\`\n${lines}...\n\`\`\`\n\n`;
          }
          
          return {
            content: [{
              type: "text" as const,
              text: `## 🧠 Project Memory Files

**Location:** \`.spec-kit/memory/\`

${mdFiles.length === 0 ? "*No memory files found. Use \`speckit: memory add\` to create one.*" : fileList}

---

## Available Actions

- **List**: \`speckit: memory list\`
- **Add**: \`speckit: memory add decisions\` - Create a new memory file
- **Update**: \`speckit: memory update constitution\` - Update existing file
- **Auto**: \`speckit: memory auto\` - Auto-enrich from current context`,
            }],
          };
        } catch (error) {
          return {
            content: [{
              type: "text" as const,
              text: `❌ Error listing memory files: ${error instanceof Error ? error.message : String(error)}`,
            }],
            isError: true,
          };
        }
      }

      // Action: auto - Auto-enrich memory from context
      if (action === "auto") {
        const constitution = await loadConstitution(projectPath);
        
        return {
          content: [{
            type: "text" as const,
            text: `## 🤖 Auto-Enrich Project Memory

**Mode:** Automatic context learning

---

## Current Constitution

${constitution || "*No constitution found*"}

---

## Copilot Instructions

Analyze the current conversation and project context to identify:

1. **Decisions** - Technical or architectural decisions made
2. **Conventions** - Coding conventions or patterns observed
3. **Learnings** - Lessons learned or best practices discovered
4. **Architecture** - System architecture insights

For each insight found:
1. Determine the appropriate memory file (or create new one)
2. Format as structured markdown
3. Save to \`.spec-kit/memory/{category}.md\`

### Memory File Format

\`\`\`markdown
# {Category} - {Project Name}

## Entry: {Date}
**Context:** {Brief context}
**Decision/Learning:** {Description}
**Rationale:** {Why this was decided/learned}
\`\`\`

After saving, confirm what was added to memory.`,
          }],
        };
      }

      // Action: add or update
      const effectiveAction = action || "add";
      const effectiveFileName = fileName || category || "notes";
      const memoryFilePath = path.join(memoryDir, `${effectiveFileName}.md`);
      
      // Check if file exists for context
      let existingContent = "";
      let fileExists = false;
      try {
        existingContent = await fs.readFile(memoryFilePath, "utf-8");
        fileExists = true;
      } catch {
        fileExists = false;
      }

      // Load prompt for memory enrichment
      const memoryPrompt = await loadPrompt(projectPath, "memory");
      const constitution = await loadConstitution(projectPath);

      // Determine suggested categories
      const suggestedCategories = [
        "**decisions** - Technical and architectural decisions",
        "**conventions** - Coding standards and patterns",
        "**architecture** - System design and structure",
        "**learnings** - Lessons learned and best practices",
        "**context** - Project background and domain knowledge",
        "**glossary** - Domain terms and definitions",
      ];

      return {
        content: [{
          type: "text" as const,
          text: `## 🧠 ${effectiveAction === "add" ? "Add to" : "Update"} Project Memory

**File:** \`.spec-kit/memory/${effectiveFileName}.md\`
**Status:** ${fileExists ? "📝 Exists (will append/update)" : "✨ New file (will create)"}

${content ? `**Content to add:**\n\`\`\`\n${content}\n\`\`\`` : "**Content:** *Copilot will ask what to add*"}

---

${existingContent ? `## Current Content\n\n\`\`\`markdown\n${existingContent.slice(0, 1000)}${existingContent.length > 1000 ? "\n...(truncated)" : ""}\n\`\`\`\n\n---\n\n` : ""}

${memoryPrompt ? `## Memory Prompt Instructions\n\n${memoryPrompt}\n\n---\n\n` : ""}

## Suggested Memory Categories

${suggestedCategories.map(c => `- ${c}`).join("\n")}

---

## Copilot Instructions

${content ? `
1. Read the content provided above
2. Format it appropriately for the memory file
3. ${fileExists ? "Append to" : "Create"} the file \`.spec-kit/memory/${effectiveFileName}.md\`
4. Use proper markdown structure with dates and context
5. Confirm what was saved
` : `
1. Ask the user what they want to add to memory
2. Determine the appropriate category/file
3. Format the content as structured markdown
4. Save to \`.spec-kit/memory/{filename}.md\`
5. Confirm what was saved

Example formats:

### For Decisions:
\`\`\`markdown
## Decision: {Title}
**Date:** ${new Date().toISOString().split("T")[0]}
**Context:** {Why this decision was needed}
**Decision:** {What was decided}
**Consequences:** {Impact of this decision}
\`\`\`

### For Conventions:
\`\`\`markdown
## Convention: {Title}
**Applies to:** {Scope}
**Rule:** {The convention}
**Example:** {Code example}
\`\`\`

### For Learnings:
\`\`\`markdown
## Learning: {Title}
**Date:** ${new Date().toISOString().split("T")[0]}
**Context:** {Situation}
**Insight:** {What was learned}
**Application:** {How to apply it}
\`\`\`
`}`,
        }],
      };
    }
  );

  // speckit_validate - Validate against rules
  server.tool(
    "speckit_validate",
    "Validate specifications or implementation against customizable rules (security, RGPD, architecture, or custom). Use this when the user says 'speckit: validate', 'valider sécurité', 'vérifier RGPD', or 'validation rules'.",
    ValidateArgsSchema.shape,
    async ({ ruleType = "security", phase = "spec", targetPath }) => {
      const projectPath = process.cwd();
      
      // Check setup
      const setup = await checkSetup(projectPath);
      if (!setup.ok) {
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ Spec-Kit Setup Required\n\nMissing: ${setup.missing.join(", ")}\n\nRun \`npx smart-spec-kit-mcp setup\` to initialize Spec-Kit in this project.`,
          }],
        };
      }

      // Load validation rules
      const rules = await loadRules(projectPath, ruleType);
      
      // If rules not found, list available rules
      if (!rules) {
        const availableRules = await listRules(projectPath);
        
        if (availableRules.length === 0) {
          return {
            content: [{
              type: "text" as const,
              text: `## ⚠️ No Validation Rules Found

No rules files found in \`.spec-kit/rules/\`.

**To add rules:**

1. Create \`.spec-kit/rules/\` directory
2. Add rule files:
   - \`security-rules.md\` - Security validation rules
   - \`rgpd-rules.md\` - GDPR/RGPD compliance rules
   - \`{custom}-rules.md\` - Your custom rules

**Run setup to install default rules:**
\`\`\`bash
npx smart-spec-kit-mcp setup --force
\`\`\`

This will install default security and RGPD rules templates.`,
            }],
          };
        }
        
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ Rule Type Not Found

Rule type \`${ruleType}\` not found.

**Available rule types:**
${availableRules.map(r => `- \`${r}\``).join("\n")}

**Usage:**
\`\`\`
speckit: validate security
speckit: validate rgpd
speckit: validate ${availableRules[0] || "custom"}
\`\`\``,
          }],
        };
      }

      // Find target document to validate
      let targetContent = "";
      let resolvedTargetPath: string | undefined = targetPath;
      
      if (!resolvedTargetPath) {
        if (phase === "spec") {
          resolvedTargetPath = (await findRecentSpec(projectPath, "spec")) ?? undefined;
        } else if (phase === "plan") {
          resolvedTargetPath = (await findRecentSpec(projectPath, "plan")) ?? undefined;
        }
      }
      
      if (resolvedTargetPath) {
        try {
          targetContent = await fs.readFile(resolvedTargetPath, "utf-8");
        } catch {
          targetContent = "";
        }
      }

      // Load validation prompt
      const validatePrompt = await loadPrompt(projectPath, "validate");
      const constitution = await loadConstitution(projectPath);

      // Determine validation title
      const ruleTypeDisplay = ruleType.charAt(0).toUpperCase() + ruleType.slice(1);
      const phaseDisplay = phase === "spec" ? "Specification" : phase === "plan" ? "Plan" : "Implementation";

      return {
        content: [{
          type: "text" as const,
          text: `## 🔍 ${ruleTypeDisplay} Validation - ${phaseDisplay} Phase

**Rule Type:** ${ruleType}
**Phase:** ${phase}
${resolvedTargetPath ? `**Target:** ${resolvedTargetPath}` : "**Target:** Current context"}

---

## Validation Rules

${rules}

---

${targetContent ? `## Document to Validate\n\n\`\`\`markdown\n${targetContent.slice(0, 3000)}${targetContent.length > 3000 ? "\n...(truncated)" : ""}\n\`\`\`\n\n---\n\n` : ""}

${validatePrompt ? `## Validation Instructions\n\n${validatePrompt}\n\n---\n\n` : ""}

${constitution ? `## Project Constitution (Context)\n\n${constitution.slice(0, 1000)}${constitution.length > 1000 ? "\n...(truncated)" : ""}\n\n---\n\n` : ""}

## Copilot Instructions

Perform a thorough validation of the ${phaseDisplay.toLowerCase()} against the ${ruleTypeDisplay} rules:

1. **Review each rule category** in the rules document
2. **For each applicable rule:**
   - Check if addressed in the target document/code
   - Mark status: ✅ Compliant | ⚠️ Partial | ❌ Non-Compliant | ➖ N/A
   - Cite specific evidence or gaps
3. **Generate a validation report** with:
   - Summary statistics
   - Critical issues (blocking)
   - Warnings (should fix)
   - Recommendations
4. **Save report** to \`specs/validations/${ruleType}-${new Date().toISOString().split("T")[0]}.md\`

### Report Template

\`\`\`markdown
# ${ruleTypeDisplay} Validation Report

**Date:** ${new Date().toISOString().split("T")[0]}
**Phase:** ${phaseDisplay}
**Target:** ${resolvedTargetPath || "N/A"}

## Summary
| Status | Count |
|--------|-------|
| ✅ Compliant | X |
| ⚠️ Partial | X |
| ❌ Non-Compliant | X |
| ➖ N/A | X |

## Critical Issues
{List any blocking non-compliant items}

## Warnings
{List partial compliance items}

## Detailed Findings
{For each rule category, list findings}

## Recommendations
{List improvement suggestions}
\`\`\``,
        }],
      };
    }
  );

  // speckit_workflow - Manage workflows
  server.tool(
    "speckit_workflow",
    "Manage multi-step workflows. Use this when the user wants to list workflows, start a workflow, or check workflow status. Triggers: 'speckit: workflow', 'démarrer un workflow', 'workflow list'.",
    WorkflowArgsSchema.shape,
    async ({ action = "list", workflowName, contextId, auto }) => {
      const projectPath = process.cwd();
      
      // Check setup
      const setup = await checkSetup(projectPath);
      if (!setup.ok) {
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ Spec-Kit Setup Required\n\nMissing: ${setup.missing.join(", ")}\n\nRun \`npx smart-spec-kit-mcp setup\` to initialize Spec-Kit in this project.`,
          }],
        };
      }

      // Action: list - Show available workflows
      if (action === "list") {
        const workflowsInfo = await listWorkflowsDetailed();
        
        let workflowList = "## 📋 Available Workflows\n\n";
        
        if (workflowsInfo.length === 0) {
          workflowList += "No workflows found. Create custom workflows in `.spec-kit/workflows/`.\n\n";
        } else {
          workflowList += "| Workflow | Description | Source |\n";
          workflowList += "|----------|-------------|--------|\n";
          
          for (const wfInfo of workflowsInfo) {
            const source = wfInfo.source === "local" ? "🔧 Local" : "📦 Built-in";
            
            // Load workflow to get description
            let description = "N/A";
            try {
              const workflow = await loadWorkflow(wfInfo.name);
              description = workflow.description || "N/A";
            } catch {
              // If loading fails, use N/A
            }
            
            workflowList += `| \`${wfInfo.name}\` | ${description} | ${source} |\n`;
          }
        }
        
        workflowList += `\n### Usage\n\n`;
        workflowList += `- **Start a workflow**: \`speckit: workflow start workflow_name="feature-standard"\`\n`;
        workflowList += `- **Auto mode**: Add \`auto=true\` to run without approval prompts\n`;
        workflowList += `- **With context**: Add \`contextId="MyFeature"\` for naming\n\n`;
        workflowList += `### Built-in Workflows\n\n`;
        workflowList += `- **feature-quick**: Quick feature (lightweight, no tasks breakdown)\n`;
        workflowList += `- **feature-standard**: Standard feature (spec → plan → tasks → implement)\n`;
        workflowList += `- **feature-full**: Full feature with validation and testing\n`;
        workflowList += `- **bugfix**: Bug fix workflow with reproduction\n`;
        
        return {
          content: [{
            type: "text" as const,
            text: workflowList,
          }],
        };
      }

      // Action: start - Start a workflow
      if (action === "start") {
        if (!workflowName) {
          return {
            content: [{
              type: "text" as const,
              text: `## ⚠️ Missing Workflow Name\n\nPlease specify which workflow to start.\n\nExample: \`speckit: workflow start workflow_name="feature-standard"\`\n\nRun \`speckit: workflow list\` to see available workflows.`,
            }],
          };
        }

        return {
          content: [{
            type: "text" as const,
            text: `## 🚀 Starting Workflow: ${workflowName}

${contextId ? `**Context:** ${contextId}\n` : ""}
${auto ? "**Mode:** Automatic (no approval prompts)\n" : "**Mode:** Manual (approval required for each step)\n"}

---

## Next Step

Call the MCP tool \`start_workflow\` to begin:

\`\`\`
workflow_name: "${workflowName}"
${contextId ? `context_id: "${contextId}"` : ""}
${auto ? "auto: true" : ""}
\`\`\`

The workflow will guide you through each step automatically.`,
          }],
        };
      }

      // Action: status - Show workflow status
      if (action === "status") {
        // Note: Workflow status requires accessing sessionManager
        // For now, provide guidance
        return {
          content: [{
            type: "text" as const,
            text: `## 📊 Workflow Status

To check the status of an active workflow, use the MCP tool \`workflow_status\`.

If you have a workflow running, it will show:
- Current step
- Completed actions
- Next action required

If no workflow is active, you'll see a message indicating no active sessions.`,
          }],
        };
      }

      return {
        content: [{
          type: "text" as const,
          text: `## ⚠️ Invalid Action\n\nSupported actions: 'list', 'start', 'status'\n\nExample: \`speckit: workflow list\``,
        }],
      };
    }
  );

  // speckit_constitution - Create or update project constitution
  server.tool(
    "speckit_constitution",
    "Create or update the project constitution with governing principles. Use this when the user says 'speckit: constitution', 'créer constitution', or wants to establish project principles.",
    ConstitutionArgsSchema.shape,
    async ({ principles, projectName }) => {
      const projectPath = process.cwd();
      const constitutionPath = path.join(projectPath, ".spec-kit", "memory", "constitution.md");
      
      // Check setup
      const setup = await checkSetup(projectPath);
      if (!setup.ok) {
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ Spec-Kit Setup Required\n\nMissing: ${setup.missing.join(", ")}\n\nRun \`npx smart-spec-kit-mcp setup\` to initialize Spec-Kit in this project.`,
          }],
        };
      }

      // Load existing constitution template
      let existingConstitution = "";
      try {
        existingConstitution = await fs.readFile(constitutionPath, "utf-8");
      } catch {
        existingConstitution = "";
      }

      // Load constitution prompt
      const constitutionPrompt = await loadPrompt(projectPath, "constitution");

      // Check if constitution is still a template (has placeholders)
      const hasPlaceholders = existingConstitution.includes("[PROJECT_NAME]") || 
                              existingConstitution.includes("[PRINCIPLE_") ||
                              existingConstitution.includes("[TECH_");

      return {
        content: [{
          type: "text" as const,
          text: `## 📜 Project Constitution ${hasPlaceholders ? "Setup" : "Update"}

**File:** \`.spec-kit/memory/constitution.md\`
**Status:** ${hasPlaceholders ? "⚙️ Template - needs configuration" : "📝 Configured - ready to update"}
${projectName ? `**Project Name:** ${projectName}` : ""}
${principles ? `**Principles provided:** Yes` : ""}

---

${constitutionPrompt ? `## Prompt Instructions\n\n${constitutionPrompt}\n\n---\n\n` : ""}

## Current Constitution

\`\`\`markdown
${existingConstitution.slice(0, 2000)}${existingConstitution.length > 2000 ? "\n...(truncated)" : ""}
\`\`\`

---

## Copilot Instructions

${hasPlaceholders ? `
### Initial Setup (Template has placeholders)

Guide the user to fill the constitution template:

1. **Ask for project name** if not provided: "${projectName || "[Ask user]"}"
2. **Ask for 3-5 core principles**. Examples:
   - Code Quality (tests, reviews, documentation)
   - Security First (OWASP, input validation)
   - User Privacy (GDPR, data minimization)
   - Performance (response times, scalability)
   - Accessibility (WCAG compliance)
3. **Ask for tech stack** (language, framework, database, testing)
4. **Ask for governance** (who can amend, review process)

For each placeholder \`[PLACEHOLDER_NAME]\`:
- Replace with the user's answer
- If user doesn't specify, use sensible defaults based on project context

After filling:
1. Save to \`.spec-kit/memory/constitution.md\`
2. Set version to 1.0.0
3. Set ratification date to today
4. Show summary of what was configured
` : `
### Update Existing Constitution

${principles ? `
The user wants to update/add these principles:
\`\`\`
${principles}
\`\`\`

1. Parse the new principles
2. Add/update them in the constitution
3. Increment version (MINOR for new principles, PATCH for clarifications)
4. Update "Last Amended" date
5. Save and confirm changes
` : `
Ask the user what they want to update:
- Add a new principle?
- Modify an existing principle?
- Update tech stack?
- Change governance rules?

Then make the appropriate changes and save.
`}
`}

### Version Bump Rules
- **MAJOR**: Principle removed or fundamentally changed
- **MINOR**: New principle or section added  
- **PATCH**: Clarifications and wording improvements

After saving, suggest: "/speckit.specify" to create specs that respect these principles.`,
        }],
      };
    }
  );

  // speckit_analyze - Cross-artifact consistency analysis
  server.tool(
    "speckit_analyze",
    "Perform cross-artifact consistency and coverage analysis across spec.md, plan.md, and tasks.md. Use this after /speckit.tasks and before /speckit.implement. Triggers: 'speckit: analyze', 'analyser', 'vérifier cohérence'.",
    AnalyzeArgsSchema.shape,
    async ({ focusArea }) => {
      const projectPath = process.cwd();
      
      // Check setup
      const setup = await checkSetup(projectPath);
      if (!setup.ok) {
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ Spec-Kit Setup Required\n\nMissing: ${setup.missing.join(", ")}\n\nRun \`npx smart-spec-kit-mcp setup\` to initialize Spec-Kit in this project.`,
          }],
        };
      }

      // Find artifacts
      const specPath = await findRecentSpec(projectPath, "spec");
      const planPath = await findRecentSpec(projectPath, "plan");
      const tasksPath = await findRecentSpec(projectPath, "tasks");

      // Load artifacts
      let specContent = "", planContent = "", tasksContent = "";
      
      if (specPath) {
        try { specContent = await fs.readFile(specPath, "utf-8"); } catch {}
      }
      if (planPath) {
        try { planContent = await fs.readFile(planPath, "utf-8"); } catch {}
      }
      if (tasksPath) {
        try { tasksContent = await fs.readFile(tasksPath, "utf-8"); } catch {}
      }

      // Load constitution for alignment check
      const constitution = await loadConstitution(projectPath);

      // Load analyze prompt
      const analyzePrompt = await loadPrompt(projectPath, "analyze");

      // Check which artifacts exist
      const hasSpec = !!specContent;
      const hasPlan = !!planContent;
      const hasTasks = !!tasksContent;

      if (!hasSpec && !hasPlan && !hasTasks) {
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ No Artifacts Found

No specification, plan, or tasks files found in \`specs/\`.

**Required workflow:**
1. \`/speckit.specify\` - Create specification
2. \`/speckit.plan\` - Create plan
3. \`/speckit.tasks\` - Generate tasks
4. \`/speckit.analyze\` - Analyze consistency (you are here)
5. \`/speckit.implement\` - Implement

Please run the preceding steps first.`,
          }],
        };
      }

      return {
        content: [{
          type: "text" as const,
          text: `## 🔍 Cross-Artifact Analysis

**Artifacts Found:**
- Specification: ${hasSpec ? `✅ ${specPath}` : "❌ Not found"}
- Plan: ${hasPlan ? `✅ ${planPath}` : "❌ Not found"}
- Tasks: ${hasTasks ? `✅ ${tasksPath}` : "❌ Not found"}
${focusArea ? `\n**Focus Area:** ${focusArea}` : ""}

---

${analyzePrompt ? `## Analysis Instructions\n\n${analyzePrompt}\n\n---\n\n` : ""}

## Specification Content
${hasSpec ? `\`\`\`markdown\n${specContent.slice(0, 2000)}${specContent.length > 2000 ? "\n...(truncated)" : ""}\n\`\`\`` : "*Not available*"}

---

## Plan Content
${hasPlan ? `\`\`\`markdown\n${planContent.slice(0, 2000)}${planContent.length > 2000 ? "\n...(truncated)" : ""}\n\`\`\`` : "*Not available*"}

---

## Tasks Content
${hasTasks ? `\`\`\`markdown\n${tasksContent.slice(0, 2000)}${tasksContent.length > 2000 ? "\n...(truncated)" : ""}\n\`\`\`` : "*Not available*"}

---

${constitution ? `## Constitution (for alignment check)\n\n\`\`\`markdown\n${constitution.slice(0, 1000)}${constitution.length > 1000 ? "\n...(truncated)" : ""}\n\`\`\`\n\n---\n\n` : ""}

## Copilot Instructions

**IMPORTANT: This is a READ-ONLY analysis. Do NOT modify any files.**

Perform the following detection passes:

### A. Duplication Detection
- Identify near-duplicate requirements
- Flag redundant content across artifacts

### B. Ambiguity Detection  
- Flag vague terms without measurable criteria (fast, scalable, intuitive)
- Flag unresolved placeholders (TODO, ???, [NEEDS CLARIFICATION])

### C. Underspecification
- Requirements missing acceptance criteria
- Tasks referencing undefined components

### D. Constitution Alignment
- Any conflicts with MUST principles
- Missing mandated sections

### E. Coverage Gaps
- Requirements with zero tasks
- Tasks with no requirement mapping
- Non-functional requirements not in tasks

### F. Inconsistency
- Terminology drift across files
- Conflicting requirements
- Task ordering issues

### Severity Classification
- **CRITICAL**: Constitution violations, missing core coverage
- **HIGH**: Duplicates, conflicts, untestable criteria  
- **MEDIUM**: Terminology drift, edge case gaps
- **LOW**: Style/wording improvements

### Output Format

Generate a report like this:

\`\`\`markdown
# Specification Analysis Report

**Analyzed:** ${new Date().toISOString().split("T")[0]}
**Artifacts:** spec.md ${hasSpec ? "✓" : "✗"} | plan.md ${hasPlan ? "✓" : "✗"} | tasks.md ${hasTasks ? "✓" : "✗"}

## Findings Summary

| ID | Category | Severity | Location | Issue | Recommendation |
|----|----------|----------|----------|-------|----------------|

## Coverage Summary

| Requirement | Tasks | Status |
|-------------|-------|--------|

## Metrics
- Total Requirements: X
- Total Tasks: Y
- Coverage: Z%
- Critical Issues: N

## Next Actions
{Recommendations based on findings}
\`\`\`

After analysis:
- If CRITICAL issues: Recommend fixing before \`/speckit.implement\`
- If only LOW/MEDIUM: Safe to proceed
- Offer to help fix specific issues`,
        }],
      };
    }
  );

  // speckit_checklist - Generate requirements quality checklists
  server.tool(
    "speckit_checklist",
    "Generate custom quality checklists that validate requirements completeness, clarity, and consistency - like 'unit tests for English'. Use after /speckit.specify. Triggers: 'speckit: checklist', 'créer checklist', 'liste de contrôle'.",
    ChecklistArgsSchema.shape,
    async ({ checklistType, focusAreas }) => {
      const projectPath = process.cwd();
      
      // Check setup
      const setup = await checkSetup(projectPath);
      if (!setup.ok) {
        return {
          content: [{
            type: "text" as const,
            text: `## ⚠️ Spec-Kit Setup Required\n\nMissing: ${setup.missing.join(", ")}\n\nRun \`npx smart-spec-kit-mcp setup\` to initialize Spec-Kit in this project.`,
          }],
        };
      }

      // Find specification
      const specPath = await findRecentSpec(projectPath, "spec");
      let specContent = "";
      if (specPath) {
        try { specContent = await fs.readFile(specPath, "utf-8"); } catch {}
      }

      // Find plan if exists
      const planPath = await findRecentSpec(projectPath, "plan");
      let planContent = "";
      if (planPath) {
        try { planContent = await fs.readFile(planPath, "utf-8"); } catch {}
      }

      // Load checklist prompt and template
      const checklistPrompt = await loadPrompt(projectPath, "checklist");
      const checklistTemplate = await loadTemplate(projectPath, "checklist-template");

      // Determine checklist type
      const effectiveType = checklistType || "requirements";

      return {
        content: [{
          type: "text" as const,
          text: `## ✅ Requirements Quality Checklist Generator

**Checklist Type:** ${effectiveType}
${focusAreas ? `**Focus Areas:** ${focusAreas}` : ""}
${specPath ? `**Specification:** ${specPath}` : "**Warning:** No specification found"}

---

## 📋 Key Concept: "Unit Tests for English"

Checklists test the **QUALITY of requirements**, NOT the implementation.

**❌ WRONG** (testing implementation):
- "Verify the button clicks correctly"
- "Test error handling works"

**✅ CORRECT** (testing requirements quality):
- "Are visual hierarchy requirements defined for all card types?" [Completeness]
- "Is 'fast loading' quantified with specific timing thresholds?" [Clarity]
- "Are requirements consistent between spec and plan?" [Consistency]

---

${checklistPrompt ? `## Checklist Instructions\n\n${checklistPrompt}\n\n---\n\n` : ""}

## Specification to Analyze
${specContent ? `\`\`\`markdown\n${specContent.slice(0, 3000)}${specContent.length > 3000 ? "\n...(truncated)" : ""}\n\`\`\`` : "*No specification found. Run /speckit.specify first.*"}

---

${planContent ? `## Plan (Additional Context)\n\n\`\`\`markdown\n${planContent.slice(0, 1500)}${planContent.length > 1500 ? "\n...(truncated)" : ""}\n\`\`\`\n\n---\n\n` : ""}

${checklistTemplate ? `## Checklist Template\n\n\`\`\`markdown\n${checklistTemplate.slice(0, 2000)}${checklistTemplate.length > 2000 ? "\n...(truncated)" : ""}\n\`\`\`\n\n---\n\n` : ""}

## Copilot Instructions

Generate a requirements quality checklist following these steps:

### 1. Analyze the Specification
Extract key signals:
- Feature domain (UX, API, security, etc.)
- Risk indicators ("critical", "must", "compliance")
- Stakeholder hints
- Explicit deliverables

### 2. Ask Clarifying Questions (max 3)
If needed, ask about:
- Scope refinement
- Risk prioritization  
- Depth calibration (lightweight vs formal)
- Audience (author, reviewer, QA)

### 3. Generate Checklist Items
Group by quality dimensions:
- **Requirement Completeness** - Are all requirements present?
- **Requirement Clarity** - Are requirements unambiguous?
- **Requirement Consistency** - Do requirements align?
- **Acceptance Criteria Quality** - Are criteria measurable?
- **Scenario Coverage** - Are all flows addressed?
- **Edge Case Coverage** - Are boundaries defined?
- **Non-Functional Requirements** - Performance, security specified?

### 4. Item Format
Each item should:
- Be a question about requirement quality
- Include quality dimension tag: [Completeness], [Clarity], [Gap], etc.
- Reference spec section if checking existing: [Spec §X.Y]
- Use [Gap] marker for missing requirements

**Pattern:**
\`- [ ] CHK001 - Are [requirement type] defined for [scenario]? [Quality Dimension, Spec §X.Y]\`

### 5. Output
Save to \`specs/checklists/${effectiveType}.md\`

Use this structure:
\`\`\`markdown
# ${effectiveType.charAt(0).toUpperCase() + effectiveType.slice(1)} Requirements Quality Checklist

**Purpose:** Validate specification quality before implementation
**Created:** ${new Date().toISOString().split("T")[0]}
**Feature:** [Link to spec]

## Requirement Completeness
- [ ] CHK001 - ...

## Requirement Clarity  
- [ ] CHK002 - ...

## Notes
- Items marked [Gap] need requirements to be added
- Complete critical items before /speckit.implement
\`\`\`

After generating, summarize:
- Total items
- Items by category
- Critical gaps found
- Suggested next steps`,
        }],
      };
    }
  );
}
