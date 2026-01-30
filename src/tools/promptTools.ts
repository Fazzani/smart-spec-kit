/**
 * Prompt Tools for Spec-Kit
 * 
 * MCP tools that load and execute prompt-as-code files from .spec-kit/prompts/
 * These tools are callable via natural language in Copilot Chat.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

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
| \`speckit: help\` | Get help | \`speckit: help workflows\` |

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
├── prompts/      # Prompt-as-Code files (customize behavior)
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
3. Mark the task as completed in tasks.md
4. Report what was implemented
5. Ask if user wants to continue with next task`,
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
}
