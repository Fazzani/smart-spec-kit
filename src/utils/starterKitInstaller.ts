/**
 * Starter Kit Installer
 * 
 * Handles the installation of Spec-Kit starter kit into user projects.
 * Copies prompts to .spec-kit/prompts/ and copilot-instructions.md to .github/
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

// Directory constants
const GITHUB_DIR = ".github";
const GITHUB_PROMPTS_DIR = "prompts";  // For slash commands
const GITHUB_AGENTS_DIR = "agents";    // For native VS Code agents (.agent.md)
const GITHUB_SKILLS_DIR = "skills";    // For agent skills (SKILL.md)
const COPILOT_INSTRUCTIONS = "copilot-instructions.md";
const SPEC_KIT_DIR = ".spec-kit";
const PROMPTS_DIR = "prompts";
const TEMPLATES_DIR = "templates";
const MEMORY_DIR = "memory";
const RULES_DIR = "rules";
const AGENTS_DIR = "agents";
const SPECS_DIR = "specs";

/**
 * Get the package root directory (where the npm package is installed)
 */
function getPackageRoot(): string {
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  // Handle Windows paths (remove leading slash if present)
  const normalizedDir = currentDir.replace(/^\/([A-Za-z]:)/, "$1");
  // Go up from dist/utils/ or src/utils/ to package root
  return path.resolve(normalizedDir, "..", "..");
}

/**
 * Check if a file or directory exists
 */
async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy a directory recursively
 */
async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Copy a file if the source exists
 */
async function copyFileIfExists(src: string, dest: string): Promise<boolean> {
  if (await exists(src)) {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
    return true;
  }
  return false;
}

/**
 * Installation result
 */
export interface InstallResult {
  success: boolean;
  created: string[];
  skipped: string[];
  errors: string[];
  vsCodeConfig: string;
}

/**
 * Install the Spec-Kit starter kit into a project
 */
export async function installStarterKit(
  projectPath: string,
  options: {
    force?: boolean;
    skipPrompts?: boolean;
    skipTemplates?: boolean;
    skipMemory?: boolean;
    skipVsCode?: boolean;
  } = {}
): Promise<InstallResult> {
  const result: InstallResult = {
    success: true,
    created: [],
    skipped: [],
    errors: [],
    vsCodeConfig: "",
  };

  const packageRoot = getPackageRoot();
  const starterKitPath = path.join(packageRoot, "starter-kit");

  // 1. Install prompts to .spec-kit/prompts/
  if (!options.skipPrompts) {
    const promptsSrc = path.join(starterKitPath, "prompts");
    const promptsDest = path.join(projectPath, SPEC_KIT_DIR, PROMPTS_DIR);

    if (await exists(promptsSrc)) {
      const promptsExist = await exists(promptsDest);
      
      if (promptsExist && !options.force) {
        result.skipped.push(`${SPEC_KIT_DIR}/${PROMPTS_DIR}`);
      } else {
        try {
          await copyDir(promptsSrc, promptsDest);
          result.created.push(`${SPEC_KIT_DIR}/${PROMPTS_DIR}`);
        } catch (error) {
          result.errors.push(`Failed to copy prompts: ${error}`);
          result.success = false;
        }
      }
    } else {
      result.errors.push(`Prompts source not found: ${promptsSrc}`);
    }
    
    // Copy copilot-instructions.md to .github/
    const instructionsSrc = path.join(starterKitPath, COPILOT_INSTRUCTIONS);
    const instructionsDest = path.join(projectPath, GITHUB_DIR, COPILOT_INSTRUCTIONS);
    
    if (await exists(instructionsSrc)) {
      const instructionsExist = await exists(instructionsDest);
      
      if (instructionsExist && !options.force) {
        result.skipped.push(`${GITHUB_DIR}/${COPILOT_INSTRUCTIONS}`);
      } else {
        try {
          await fs.mkdir(path.join(projectPath, GITHUB_DIR), { recursive: true });
          await fs.copyFile(instructionsSrc, instructionsDest);
          result.created.push(`${GITHUB_DIR}/${COPILOT_INSTRUCTIONS}`);
        } catch (error) {
          result.errors.push(`Failed to copy copilot-instructions: ${error}`);
          result.success = false;
        }
      }
    }

    // Copy GitHub prompts (slash commands) to .github/prompts/
    const githubPromptsSrc = path.join(starterKitPath, "github-prompts");
    const githubPromptsDest = path.join(projectPath, GITHUB_DIR, GITHUB_PROMPTS_DIR);

    if (await exists(githubPromptsSrc)) {
      const githubPromptsExist = await exists(githubPromptsDest);
      
      if (githubPromptsExist && !options.force) {
        result.skipped.push(`${GITHUB_DIR}/${GITHUB_PROMPTS_DIR}`);
      } else {
        try {
          await copyDir(githubPromptsSrc, githubPromptsDest);
          result.created.push(`${GITHUB_DIR}/${GITHUB_PROMPTS_DIR} (slash commands)`);
        } catch (error) {
          result.errors.push(`Failed to copy GitHub prompts: ${error}`);
          result.success = false;
        }
      }
    }

    // Copy native VS Code agents (.agent.md) to .github/agents/
    const githubAgentsSrc = path.join(starterKitPath, "github-agents");
    const githubAgentsDest = path.join(projectPath, GITHUB_DIR, GITHUB_AGENTS_DIR);

    if (await exists(githubAgentsSrc)) {
      const githubAgentsExist = await exists(githubAgentsDest);
      
      if (githubAgentsExist && !options.force) {
        result.skipped.push(`${GITHUB_DIR}/${GITHUB_AGENTS_DIR}`);
      } else {
        try {
          await copyDir(githubAgentsSrc, githubAgentsDest);
          result.created.push(`${GITHUB_DIR}/${GITHUB_AGENTS_DIR} (native VS Code agents)`);
        } catch (error) {
          result.errors.push(`Failed to copy GitHub agents: ${error}`);
          result.success = false;
        }
      }
    }

    // Copy agent skills (SKILL.md) to .github/skills/
    const githubSkillsSrc = path.join(starterKitPath, "github-skills");
    const githubSkillsDest = path.join(projectPath, GITHUB_DIR, GITHUB_SKILLS_DIR);

    if (await exists(githubSkillsSrc)) {
      const githubSkillsExist = await exists(githubSkillsDest);
      
      if (githubSkillsExist && !options.force) {
        result.skipped.push(`${GITHUB_DIR}/${GITHUB_SKILLS_DIR}`);
      } else {
        try {
          await copyDir(githubSkillsSrc, githubSkillsDest);
          result.created.push(`${GITHUB_DIR}/${GITHUB_SKILLS_DIR} (agent skills)`);
        } catch (error) {
          result.errors.push(`Failed to copy GitHub skills: ${error}`);
          result.success = false;
        }
      }
    }
  }

  // 2. Install templates to .spec-kit/templates/
  if (!options.skipTemplates) {
    const templatesSrc = path.join(starterKitPath, "templates");
    const templatesDest = path.join(projectPath, SPEC_KIT_DIR, TEMPLATES_DIR);

    if (await exists(templatesSrc)) {
      const templatesExist = await exists(templatesDest);
      
      if (templatesExist && !options.force) {
        result.skipped.push(`${SPEC_KIT_DIR}/${TEMPLATES_DIR}`);
      } else {
        try {
          await copyDir(templatesSrc, templatesDest);
          result.created.push(`${SPEC_KIT_DIR}/${TEMPLATES_DIR}`);
        } catch (error) {
          result.errors.push(`Failed to copy templates: ${error}`);
          result.success = false;
        }
      }
    } else {
      result.errors.push(`Templates source not found: ${templatesSrc}`);
    }
  }

  // 3. Install memory/constitution.md to .spec-kit/memory/
  if (!options.skipMemory) {
    const memorySrc = path.join(starterKitPath, "memory");
    const memoryDest = path.join(projectPath, SPEC_KIT_DIR, MEMORY_DIR);

    if (await exists(memorySrc)) {
      const memoryExists = await exists(memoryDest);
      
      if (memoryExists && !options.force) {
        result.skipped.push(`${SPEC_KIT_DIR}/${MEMORY_DIR}`);
      } else {
        try {
          await copyDir(memorySrc, memoryDest);
          result.created.push(`${SPEC_KIT_DIR}/${MEMORY_DIR}`);
        } catch (error) {
          result.errors.push(`Failed to copy memory: ${error}`);
          result.success = false;
        }
      }
    }
  }

  // 4. Install rules to .spec-kit/rules/
  const rulesSrc = path.join(starterKitPath, "rules");
  const rulesDest = path.join(projectPath, SPEC_KIT_DIR, RULES_DIR);

  if (await exists(rulesSrc)) {
    const rulesExist = await exists(rulesDest);
    
    if (rulesExist && !options.force) {
      result.skipped.push(`${SPEC_KIT_DIR}/${RULES_DIR}`);
    } else {
      try {
        await copyDir(rulesSrc, rulesDest);
        result.created.push(`${SPEC_KIT_DIR}/${RULES_DIR}`);
      } catch (error) {
        result.errors.push(`Failed to copy rules: ${error}`);
        result.success = false;
      }
    }
  }

  // 5. Install agents to .spec-kit/agents/
  const agentsSrc = path.join(starterKitPath, "agents");
  const agentsDest = path.join(projectPath, SPEC_KIT_DIR, AGENTS_DIR);

  if (await exists(agentsSrc)) {
    const agentsExist = await exists(agentsDest);
    
    if (agentsExist && !options.force) {
      result.skipped.push(`${SPEC_KIT_DIR}/${AGENTS_DIR}`);
    } else {
      try {
        await copyDir(agentsSrc, agentsDest);
        result.created.push(`${SPEC_KIT_DIR}/${AGENTS_DIR}`);
      } catch (error) {
        result.errors.push(`Failed to copy agents: ${error}`);
        result.success = false;
      }
    }
  }

  // 6. Create specs/ directory
  const specsDir = path.join(projectPath, SPECS_DIR);
  if (!(await exists(specsDir))) {
    try {
      await fs.mkdir(specsDir, { recursive: true });
      // Create a .gitkeep file to preserve the directory
      await fs.writeFile(path.join(specsDir, ".gitkeep"), "");
      result.created.push(SPECS_DIR);
    } catch (error) {
      result.errors.push(`Failed to create specs directory: ${error}`);
    }
  }

  // Create specs/validations/ directory for validation reports
  const validationsDir = path.join(specsDir, "validations");
  if (!(await exists(validationsDir))) {
    try {
      await fs.mkdir(validationsDir, { recursive: true });
      await fs.writeFile(path.join(validationsDir, ".gitkeep"), "");
      result.created.push(`${SPECS_DIR}/validations`);
    } catch (error) {
      // Non-blocking error
    }
  }

  // 6. Generate VS Code MCP configuration
  if (!options.skipVsCode) {
    result.vsCodeConfig = generateVsCodeConfig();
  }

  return result;
}

/**
 * Generate VS Code MCP configuration for settings.json
 * Includes MCP server config and agent/skill file locations for VS Code 1.109+
 */
export function generateVsCodeConfig(): string {
  return JSON.stringify({
    "mcp": {
      "servers": {
        "spec-kit": {
          "command": "npx",
          "args": ["-y", "spec-kit-mcp"]
        }
      }
    },
    "chat.agentFilesLocations": [
      ".github/agents"
    ],
    "chat.agentSkillsLocations": [
      ".github/skills"
    ],
    "github.copilot.chat.copilotMemory.enabled": true
  }, null, 2);
}

/**
 * Generate human-readable installation report
 */
export function formatInstallReport(result: InstallResult, projectPath: string): string {
  let report = "";

  if (result.success) {
    report += "# ✅ Spec-Kit Starter Kit Installed!\n\n";
  } else {
    report += "# ⚠️ Spec-Kit Installation Completed with Errors\n\n";
  }

  if (result.created.length > 0) {
    report += "## Created\n\n";
    for (const item of result.created) {
      report += `- 📁 \`${item}\`\n`;
    }
    report += "\n";
  }

  if (result.skipped.length > 0) {
    report += "## Skipped (already exist, use --force to overwrite)\n\n";
    for (const item of result.skipped) {
      report += `- ⏭️ \`${item}\`\n`;
    }
    report += "\n";
  }

  if (result.errors.length > 0) {
    report += "## Errors\n\n";
    for (const error of result.errors) {
      report += `- ❌ ${error}\n`;
    }
    report += "\n";
  }

  report += "## Project Structure\n\n";
  report += "```\n";
  report += `${path.basename(projectPath)}/\n`;
  report += "├── .github/\n";
  report += "│   ├── prompts/                  # Slash commands for Copilot\n";
  report += "│   │   ├── speckit.specify.prompt.md\n";
  report += "│   │   ├── speckit.plan.prompt.md\n";
  report += "│   │   ├── speckit.tasks.prompt.md\n";
  report += "│   │   ├── speckit.implement.prompt.md\n";
  report += "│   │   └── ...\n";
  report += "│   ├── agents/                   # Native VS Code agents (1.109+)\n";
  report += "│   │   ├── speckit-spec.agent.md\n";
  report += "│   │   ├── speckit-plan.agent.md\n";
  report += "│   │   ├── speckit-conductor.agent.md\n";
  report += "│   │   └── ...\n";
  report += "│   ├── skills/                   # Agent skills (1.109+)\n";
  report += "│   │   ├── spec-driven-dev/SKILL.md\n";
  report += "│   │   ├── security-validation/SKILL.md\n";
  report += "│   │   └── api-design/SKILL.md\n";
  report += "│   └── copilot-instructions.md   # Instructions for Copilot\n";
  report += "├── .spec-kit/\n";
  report += "│   ├── prompts/             # Customizable prompts (read by MCP)\n";
  report += "│   ├── templates/           # Specification templates\n";
  report += "│   ├── rules/               # Validation rules (security, RGPD)\n";
  report += "│   ├── agents/              # Customizable AI agents (system prompts)\n";
  report += "│   └── memory/              # Project context\n";
  report += "│       └── constitution.md  # Project principles\n";
  report += "├── specs/                   # Generated specifications\n";
  report += "│   └── validations/         # Validation reports\n";
  report += "```\n\n";

  report += "## VS Code Configuration\n\n";
  report += "Add this to your `.vscode/settings.json` to enable MCP tools and native agents:\n\n";
  report += "```json\n";
  report += result.vsCodeConfig;
  report += "\n```\n\n";
  report += "> **VS Code 1.109+**: The `chat.agentFilesLocations` and `chat.agentSkillsLocations` settings enable native agent discovery from `.github/agents/` and `.github/skills/`.\n";
  report += "> Enable `github.copilot.chat.copilotMemory.enabled` for persistent cross-session memory.\n\n";

  report += "## Next Steps\n\n";
  report += "1. **Edit your constitution**: `.spec-kit/memory/constitution.md`\n";
  report += "2. **Customize validation rules**: `.spec-kit/rules/`\n";
  report += "3. **Try native agents** (VS Code 1.109+): `@SpecKit-Conductor` in chat\n";
  report += "4. **Use slash commands** in Copilot Chat:\n";
  report += "   - `/speckit.specify` - Create a specification\n";
  report += "   - `/speckit.plan` - Create implementation plan\n";
  report += "   - `/speckit.tasks` - Generate task breakdown\n";
  report += "   - `/speckit.implement` - Start implementation\n";
  report += "   - `/speckit.validate` - Validate against rules\n";
  report += "   - `/speckit.help` - Get help\n\n";

  report += "## Available Slash Commands\n\n";
  report += "| Slash Command | Description |\n";
  report += "|---------------|-------------|\n";
  report += "| `/speckit.specify` | Create specification from requirements |\n";
  report += "| `/speckit.clarify` | Clarify ambiguous requirements |\n";
  report += "| `/speckit.plan` | Create technical implementation plan |\n";
  report += "| `/speckit.tasks` | Generate task breakdown |\n";
  report += "| `/speckit.implement` | Execute implementation tasks |\n";
  report += "| `/speckit.validate` | Validate against customizable rules |\n";
  report += "| `/speckit.memory` | Manage project memory and context |\n";
  report += "| `/speckit.help` | Get help and documentation |\n\n";

  report += "## Alternative: Keyword Commands\n\n";
  report += "You can also use keyword-based commands:\n";
  report += "- `speckit: spec` or `créer une spec`\n";
  report += "- `speckit: plan` or `planifier`\n";
  report += "- `speckit: implement` or `implémenter`\n";

  return report;
}

/**
 * Check if a project already has Spec-Kit installed
 */
export async function isSpecKitInstalled(projectPath: string): Promise<{
  hasPrompts: boolean;
  hasInstructions: boolean;
  hasTemplates: boolean;
  hasMemory: boolean;
  hasSpecs: boolean;
  hasSlashCommands: boolean;
  hasNativeAgents: boolean;
  hasSkills: boolean;
}> {
  return {
    hasPrompts: await exists(path.join(projectPath, SPEC_KIT_DIR, PROMPTS_DIR)),
    hasInstructions: await exists(path.join(projectPath, GITHUB_DIR, COPILOT_INSTRUCTIONS)),
    hasTemplates: await exists(path.join(projectPath, SPEC_KIT_DIR, TEMPLATES_DIR)),
    hasMemory: await exists(path.join(projectPath, SPEC_KIT_DIR, MEMORY_DIR)),
    hasSpecs: await exists(path.join(projectPath, SPECS_DIR)),
    hasSlashCommands: await exists(path.join(projectPath, GITHUB_DIR, GITHUB_PROMPTS_DIR)),
    hasNativeAgents: await exists(path.join(projectPath, GITHUB_DIR, GITHUB_AGENTS_DIR)),
    hasSkills: await exists(path.join(projectPath, GITHUB_DIR, GITHUB_SKILLS_DIR)),
  };
}
