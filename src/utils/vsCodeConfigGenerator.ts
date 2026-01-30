/**
 * VS Code Configuration Generator
 * 
 * Generates the MCP server configuration for VS Code settings.json
 */

import * as path from "node:path";

interface McpServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface VsCodeMcpConfig {
  "mcp": {
    servers: Record<string, McpServerConfig>;
  };
}

/**
 * Generate the VS Code MCP configuration for Spec-Kit server
 * @param projectPath - Absolute path to the spec-kit-mcp project
 * @returns Configuration object for VS Code settings.json
 */
export function generateSpecKitConfig(projectPath: string): VsCodeMcpConfig {
  const normalizedPath = path.resolve(projectPath);
  
  return {
    "mcp": {
      servers: {
        "spec-kit": {
          command: "node",
          args: [path.join(normalizedPath, "dist", "index.js")],
        },
      },
    },
  };
}

/**
 * Generate configuration snippet as a formatted JSON string
 * Ready to be merged into VS Code settings.json
 */
export function generateConfigSnippet(projectPath: string): string {
  const config = generateSpecKitConfig(projectPath);
  return JSON.stringify(config, null, 2);
}

/**
 * Print configuration instructions to console
 */
export function printSetupInstructions(projectPath: string): void {
  const normalizedPath = path.resolve(projectPath);
  
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║           SPEC-KIT MCP SERVER - VS CODE CONFIGURATION            ║
╚══════════════════════════════════════════════════════════════════╝

Add the following to your VS Code settings.json (User or Workspace):

─────────────────────────────────────────────────────────────────────
{
  "mcp": {
    "servers": {
      "spec-kit": {
        "command": "node",
        "args": ["${normalizedPath.replaceAll("\\", "\\\\")}\\\\dist\\\\index.js"]
      }
    }
  }
}
─────────────────────────────────────────────────────────────────────

📋 Quick Setup Steps:
  1. Build the project:  npm run build
  2. Open VS Code Settings (Ctrl+Shift+P → "Preferences: Open User Settings (JSON)")
  3. Add the "spec-kit" server config to your existing "mcp.servers" object
  4. Reload VS Code window (Ctrl+Shift+P → "Developer: Reload Window")
  5. Test in Copilot Chat: Ask to use the "ping" tool

💡 If you already have Azure DevOps MCP configured, your final config should look like:

{
  "mcp": {
    "servers": {
      "azure-devops": {
        // ... your existing Azure DevOps config ...
      },
      "spec-kit": {
        "command": "node",
        "args": ["${normalizedPath.replaceAll("\\", "\\\\")}\\\\dist\\\\index.js"]
      }
    }
  }
}

`);
}

// CLI execution
if (process.argv[1]?.includes("vsCodeConfigGenerator")) {
  const projectPath = process.argv[2] || process.cwd();
  printSetupInstructions(projectPath);
}
