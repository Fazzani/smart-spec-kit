#!/usr/bin/env node
/**
 * Spec-Kit Setup CLI
 * 
 * Automatise l'installation de Spec-Kit sur une machine de développement:
 * - Copie les slash commands (prompts) dans le projet
 * - Configure VS Code settings.json
 * - Affiche les instructions
 * 
 * Usage: npx smart-spec-kit-mcp setup [options]
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, "..");

// Couleurs pour le terminal
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  bold: "\x1b[1m",
};

function log(message: string, color = colors.reset): void {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step: number, message: string): void {
  console.log(`\n${colors.cyan}[${step}/5]${colors.reset} ${colors.bold}${message}${colors.reset}`);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isDirEmpty(dirPath: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dirPath);
    return files.length === 0;
  } catch {
    return true; // If can't read, treat as empty
  }
}

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyDir(src: string, dest: string): Promise<number> {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });
  let count = 0;
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      count += await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
      count++;
    }
  }
  
  return count;
}

async function getVSCodeSettingsPath(): Promise<string | null> {
  const platform = os.platform();
  let settingsPath: string;
  
  if (platform === "win32") {
    settingsPath = path.join(os.homedir(), "AppData", "Roaming", "Code", "User", "settings.json");
  } else if (platform === "darwin") {
    settingsPath = path.join(os.homedir(), "Library", "Application Support", "Code", "User", "settings.json");
  } else {
    settingsPath = path.join(os.homedir(), ".config", "Code", "User", "settings.json");
  }
  
  // Check for VS Code Insiders
  if (!(await fileExists(settingsPath))) {
    const insidersPath = settingsPath.replace("Code", "Code - Insiders");
    if (await fileExists(insidersPath)) {
      return insidersPath;
    }
  }
  
  return settingsPath;
}

/**
 * Get the VS Code User directory path
 */
function getVSCodeUserPath(): string {
  const platform = os.platform();
  if (platform === "win32") {
    return path.join(os.homedir(), "AppData", "Roaming", "Code", "User");
  } else if (platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "Code", "User");
  } else {
    return path.join(os.homedir(), ".config", "Code", "User");
  }
}

/**
 * Detect all VS Code profiles
 */
async function detectVSCodeProfiles(): Promise<{ id: string; name: string; mcpPath: string }[]> {
  const userPath = getVSCodeUserPath();
  const profilesPath = path.join(userPath, "profiles");
  const profiles: { id: string; name: string; mcpPath: string }[] = [];
  
  // Check for profiles directory
  if (await fileExists(profilesPath)) {
    try {
      const entries = await fs.readdir(profilesPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const profileId = entry.name;
          const mcpPath = path.join(profilesPath, profileId, "mcp.json");
          
          // Try to get profile name from settings or use ID
          let profileName = profileId;
          const settingsPath = path.join(profilesPath, profileId, "settings.json");
          if (await fileExists(settingsPath)) {
            try {
              const content = await fs.readFile(settingsPath, "utf-8");
              const settings = JSON.parse(content.replace(/\/\/.*$/gm, ""));
              if (settings["workbench.settings.applyToAllProfiles"]) {
                profileName = `Profile ${profileId.slice(0, 8)}`;
              }
            } catch {
              // Ignore parse errors
            }
          }
          
          profiles.push({ id: profileId, name: profileName, mcpPath });
        }
      }
    } catch {
      // Ignore errors reading profiles
    }
  }
  
  // Also add the default profile (User level mcp.json)
  const defaultMcpPath = path.join(userPath, "mcp.json");
  profiles.unshift({ id: "default", name: "Default", mcpPath: defaultMcpPath });
  
  return profiles;
}

/**
 * Update MCP configuration in a profile's mcp.json
 */
async function updateProfileMcpConfig(mcpPath: string, dryRun: boolean): Promise<boolean> {
  let config: { servers: Record<string, unknown> } = { servers: {} };
  
  // Read existing mcp.json if it exists
  if (await fileExists(mcpPath)) {
    try {
      const content = await fs.readFile(mcpPath, "utf-8");
      config = JSON.parse(content);
      if (!config.servers) {
        config.servers = {};
      }
    } catch {
      config = { servers: {} };
    }
  }
  
  // Check if spec-kit already configured
  if (config.servers["spec-kit"]) {
    return false; // Already configured
  }
  
  // Add spec-kit configuration
  config.servers["spec-kit"] = {
    command: "npx",
    args: ["-y", "smart-spec-kit-mcp"],
    disabled: false,
    alwaysAllow: [
      "speckit_specify",
      "speckit_plan",
      "speckit_tasks",
      "speckit_implement",
      "speckit_clarify",
      "speckit_validate",
      "speckit_memory",
      "speckit_help",
      "speckit_constitution",
      "speckit_analyze",
      "speckit_checklist",
      "list_workflows",
      "start_workflow",
      "advance_workflow",
      "get_template"
    ]
  };
  
  if (!dryRun) {
    await ensureDir(path.dirname(mcpPath));
    await fs.writeFile(mcpPath, JSON.stringify(config, null, 2), "utf-8");
  }
  
  return true;
}

async function updateVSCodeSettings(settingsPath: string): Promise<boolean> {
  let settings: Record<string, unknown> = {};
  
  // Read existing settings
  if (await fileExists(settingsPath)) {
    try {
      const content = await fs.readFile(settingsPath, "utf-8");
      // Remove comments (simple approach for JSON with comments)
      const cleanContent = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      settings = JSON.parse(cleanContent);
    } catch {
      log("⚠️  Impossible de parser settings.json existant, création d'un nouveau", colors.yellow);
      settings = {};
    }
  }
  
  // Check if MCP config already exists
  const mcp = settings.mcp as Record<string, unknown> | undefined;
  const servers = mcp?.servers as Record<string, unknown> | undefined;
  
  if (servers?.["spec-kit"]) {
    log("   spec-kit déjà configuré dans VS Code", colors.green);
    return false;
  }
  
  // Add spec-kit configuration
  if (!settings.mcp) {
    settings.mcp = { servers: {} };
  }
  if (!(settings.mcp as Record<string, unknown>).servers) {
    (settings.mcp as Record<string, unknown>).servers = {};
  }
  
  const mcpServers = (settings.mcp as Record<string, unknown>).servers as Record<string, unknown>;
  mcpServers["spec-kit"] = {
    command: "npx",
    args: ["-y", "smart-spec-kit-mcp"]
  };
  
  // Write updated settings
  await ensureDir(path.dirname(settingsPath));
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
  
  return true;
}

async function copyPromptsToProject(projectPath: string): Promise<number> {
  // New structure: prompts are in starter-kit/prompts/ and go to .spec-kit/prompts/
  // These prompts are read by the MCP tools, not by Copilot directly
  const srcPrompts = path.join(PACKAGE_ROOT, "starter-kit", "prompts");
  const destPrompts = path.join(projectPath, ".spec-kit", "prompts");
  
  if (!(await fileExists(srcPrompts))) {
    log(`⚠️  Dossier prompts non trouvé: ${srcPrompts}`, colors.yellow);
    return 0;
  }
  
  return await copyDir(srcPrompts, destPrompts);
}

async function copyCopilotInstructions(projectPath: string): Promise<boolean> {
  // Copy copilot-instructions.md to .github/copilot-instructions.md
  const srcInstructions = path.join(PACKAGE_ROOT, "starter-kit", "copilot-instructions.md");
  const destInstructions = path.join(projectPath, ".github", "copilot-instructions.md");
  
  if (!(await fileExists(srcInstructions))) {
    log(`⚠️  Fichier copilot-instructions.md non trouvé: ${srcInstructions}`, colors.yellow);
    return false;
  }
  
  await ensureDir(path.dirname(destInstructions));
  await fs.copyFile(srcInstructions, destInstructions);
  return true;
}

async function copyGitHubPrompts(projectPath: string): Promise<number> {
  // Copy slash commands (.prompt.md files) to .github/prompts/
  const srcPrompts = path.join(PACKAGE_ROOT, "starter-kit", "github-prompts");
  const destPrompts = path.join(projectPath, ".github", "prompts");
  
  if (!(await fileExists(srcPrompts))) {
    log(`⚠️  Dossier github-prompts non trouvé: ${srcPrompts}`, colors.yellow);
    return 0;
  }
  
  return await copyDir(srcPrompts, destPrompts);
}

async function addToGitignore(projectPath: string): Promise<void> {
  const gitignorePath = path.join(projectPath, ".gitignore");
  const specKitIgnore = "\n# Spec-Kit sessions (auto-generated)\n.spec-kit-sessions/\n";
  
  if (await fileExists(gitignorePath)) {
    const content = await fs.readFile(gitignorePath, "utf-8");
    if (!content.includes(".spec-kit-sessions")) {
      await fs.appendFile(gitignorePath, specKitIgnore);
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Help command
  if (command === "setup" && (args.includes("--help") || args.includes("-h"))) {
    console.log(`
${colors.bold}Spec-Kit Setup CLI${colors.reset}

${colors.cyan}Usage:${colors.reset}
  npx smart-spec-kit-mcp setup [options]

${colors.cyan}Options:${colors.reset}
  --project <path>   Chemin du projet (défaut: répertoire courant)
  --skip-vscode      Ne pas modifier VS Code settings.json
  --skip-prompts     Ne pas copier les prompts MCP
  --dry-run          Afficher ce qui serait fait sans rien modifier
  -h, --help         Afficher cette aide

${colors.cyan}Exemples:${colors.reset}
  npx smart-spec-kit-mcp setup
  npx smart-spec-kit-mcp setup --project ./mon-projet
  npx smart-spec-kit-mcp setup --dry-run
  npx smart-spec-kit-mcp setup --skip-vscode
`);
    return;
  }
  
  if (command !== "setup") {
    // If no setup command, run as MCP server (default behavior)
    // Import and run the main server
    await import("./index.js");
    return;
  }
  
  // Parse options
  const projectPath: string = args.includes("--project") 
    ? (args[args.indexOf("--project") + 1] ?? process.cwd())
    : process.cwd();
  const skipVSCode = args.includes("--skip-vscode");
  const skipPrompts = args.includes("--skip-prompts");
  const dryRun = args.includes("--dry-run");
  
  console.log(`
${colors.cyan}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${colors.bold}🚀 Spec-Kit Setup${colors.reset}${colors.cyan}${dryRun ? " (DRY RUN)" : ""}                                       ║
║   Installation automatisée pour développeurs              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
`);

  if (dryRun) {
    log("🔍 Mode dry-run: aucune modification ne sera effectuée\n", colors.yellow);
  }

  log(`📁 Projet: ${projectPath}`, colors.blue);
  
  // Step 1: Copy prompts to project
  if (!skipPrompts) {
    logStep(1, "Installation des prompts et slash commands...");
    if (dryRun) {
      log("   📋 Copierait les prompts dans .spec-kit/prompts/", colors.yellow);
      log("   📋 Copierait les slash commands dans .github/prompts/", colors.yellow);
      log("   📋 Copierait copilot-instructions.md dans .github/", colors.yellow);
    } else {
      const promptsCount = await copyPromptsToProject(projectPath);
      if (promptsCount > 0) {
        log(`   ✅ ${promptsCount} prompts copiés dans .spec-kit/prompts/`, colors.green);
      } else {
        log("   ⏭️  Aucun prompt à copier", colors.yellow);
      }
      
      // Copy slash commands (.prompt.md files) to .github/prompts/
      const slashCommandsCount = await copyGitHubPrompts(projectPath);
      if (slashCommandsCount > 0) {
        log(`   ✅ ${slashCommandsCount} slash commands copiés dans .github/prompts/`, colors.green);
      } else {
        log("   ⚠️  Pas de slash commands à copier", colors.yellow);
      }
      
      // Copy copilot-instructions.md
      const instructionsCopied = await copyCopilotInstructions(projectPath);
      if (instructionsCopied) {
        log("   ✅ copilot-instructions.md copié dans .github/", colors.green);
      }
    }
  } else {
    logStep(1, "Prompts MCP (ignoré)");
  }
  
  // Step 2: Configure VS Code (settings.json - legacy)
  if (!skipVSCode) {
    logStep(2, "Configuration de VS Code...");
    const settingsPath = await getVSCodeSettingsPath();
    if (settingsPath) {
      if (dryRun) {
        log(`   📋 Ajouterait MCP server à ${settingsPath}`, colors.yellow);
      } else {
        const updated = await updateVSCodeSettings(settingsPath);
        if (updated) {
          log(`   ✅ MCP server ajouté à ${settingsPath}`, colors.green);
        }
      }
    } else {
      log("   ⚠️  VS Code settings.json non trouvé", colors.yellow);
    }
  } else {
    logStep(2, "VS Code config (ignoré)");
  }
  
  // Step 3: Configure VS Code profiles (mcp.json)
  logStep(3, "Configuration des profils VS Code...");
  const profiles = await detectVSCodeProfiles();
  
  if (profiles.length > 0) {
    let configuredCount = 0;
    for (const profile of profiles) {
      if (dryRun) {
        log(`   📋 Ajouterait spec-kit au profil "${profile.name}"`, colors.yellow);
      } else {
        const updated = await updateProfileMcpConfig(profile.mcpPath, false);
        if (updated) {
          log(`   ✅ spec-kit ajouté au profil "${profile.name}"`, colors.green);
          configuredCount++;
        } else {
          log(`   ⏭️  spec-kit déjà configuré dans "${profile.name}"`, colors.yellow);
        }
      }
    }
    if (!dryRun && configuredCount === 0) {
      log("   ✅ spec-kit déjà configuré dans tous les profils", colors.green);
    }
  } else {
    log("   ℹ️  Aucun profil VS Code détecté", colors.blue);
  }
  
  // Step 4: Update .gitignore
  logStep(4, "Mise à jour .gitignore...");
  if (dryRun) {
    log("   📋 Ajouterait .spec-kit-sessions/ au .gitignore", colors.yellow);
  } else {
    await addToGitignore(projectPath);
    log("   ✅ .spec-kit-sessions/ ajouté au .gitignore", colors.green);
  }
  
  // Step 5: Create .spec-kit directory with templates and constitution
  logStep(5, "Installation des templates et config...");
  const specKitDir = path.join(projectPath, ".spec-kit");
  const specsDir = path.join(projectPath, "specs");
  
  // Copy templates from starter-kit
  const srcTemplates = path.join(PACKAGE_ROOT, "starter-kit", "templates");
  const destTemplates = path.join(specKitDir, "templates");
  
  // Copy memory (constitution) from starter-kit
  const srcMemory = path.join(PACKAGE_ROOT, "starter-kit", "memory");
  const destMemory = path.join(specKitDir, "memory");

  // Copy default workflows from package
  const srcWorkflows = path.join(PACKAGE_ROOT, "workflows");
  const destWorkflows = path.join(specKitDir, "workflows");
  
  if (dryRun) {
    log("   📋 Créerait .spec-kit/templates/", colors.yellow);
    log("   📋 Créerait .spec-kit/memory/", colors.yellow);
    log("   📋 Créerait .spec-kit/workflows/", colors.yellow);
    log("   📋 Créerait specs/", colors.yellow);
  } else {
    // Copy templates if source exists and dest is empty or doesn't exist
    if (await fileExists(srcTemplates)) {
      const destEmpty = !(await fileExists(destTemplates)) || (await isDirEmpty(destTemplates));
      if (destEmpty) {
        const count = await copyDir(srcTemplates, destTemplates);
        log(`   ✅ ${count} templates copiés dans .spec-kit/templates/`, colors.green);
      } else {
        log("   ⏭️  .spec-kit/templates/ contient déjà des fichiers", colors.yellow);
      }
    }
    
    // Copy memory/constitution if source exists and dest is empty
    if (await fileExists(srcMemory)) {
      const destEmpty = !(await fileExists(destMemory)) || (await isDirEmpty(destMemory));
      if (destEmpty) {
        await copyDir(srcMemory, destMemory);
        log("   ✅ Constitution copiée dans .spec-kit/memory/", colors.green);
      } else {
        log("   ⏭️  .spec-kit/memory/ contient déjà des fichiers", colors.yellow);
      }
    }

    // Copy default workflows if source exists and dest is empty
    if (await fileExists(srcWorkflows)) {
      const destEmpty = !(await fileExists(destWorkflows)) || (await isDirEmpty(destWorkflows));
      if (destEmpty) {
        const count = await copyDir(srcWorkflows, destWorkflows);
        log(`   ✅ ${count} workflows copiés dans .spec-kit/workflows/`, colors.green);
      } else {
        log("   ⏭️  .spec-kit/workflows/ contient déjà des fichiers", colors.yellow);
      }
    }
    
    // Create specs directory
    if (!(await fileExists(specsDir))) {
      await ensureDir(specsDir);
      await fs.writeFile(path.join(specsDir, ".gitkeep"), "");
      log("   ✅ Dossier specs/ créé", colors.green);
    } else {
      log("   ⏭️  specs/ existe déjà", colors.yellow);
    }
  }
  
  // Final instructions
  if (dryRun) {
    console.log(`
${colors.yellow}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${colors.bold}🔍 Dry run terminé - aucune modification effectuée${colors.reset}${colors.yellow}       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}

Exécutez sans --dry-run pour appliquer les changements.
`);
    return;
  }
  
  console.log(`
${colors.green}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${colors.bold}✅ Installation terminée!${colors.reset}${colors.green}                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}

${colors.bold}Prochaines étapes:${colors.reset}

1. ${colors.cyan}Rechargez VS Code:${colors.reset}
   Ctrl+Shift+P → "Developer: Reload Window"

2. ${colors.cyan}Configurez votre constitution projet:${colors.reset}
   Utilisez /speckit.constitution pour définir les principes
   ou éditez directement .spec-kit/memory/constitution.md

3. ${colors.cyan}Utilisez les slash commands dans Copilot Chat:${colors.reset}
   Tapez / et cherchez les commandes /speckit.*

${colors.bold}Slash Commands Disponibles:${colors.reset}
   /speckit.init          Initialiser Spec-Kit (guidé ou auto)
   /speckit.constitution  Configurer la constitution projet
   /speckit.specify       Créer une spécification
   /speckit.checklist     Générer un checklist de qualité
   /speckit.plan          Créer le plan technique
   /speckit.tasks         Générer les tâches
   /speckit.analyze       Analyser la cohérence des artifacts
   /speckit.implement     Implémenter les tâches
   /speckit.clarify       Clarifier les requirements
   /speckit.validate      Valider la conformité (sécurité, RGPD...)
   /speckit.memory        Gérer la mémoire projet
   /speckit.help          Obtenir de l'aide sur Spec-Kit

${colors.bold}Workflow Recommandé:${colors.reset}
   1. /speckit.constitution pour définir les principes
   2. /speckit.specify pour décrire votre feature
   3. /speckit.checklist pour valider la qualité des specs
   4. /speckit.plan pour créer le plan technique
   5. /speckit.tasks pour générer les tâches
   6. /speckit.analyze pour vérifier la traçabilité
   7. /speckit.implement pour coder
   8. /speckit.validate pour vérifier la conformité
   9. /speckit.memory pour documenter les décisions

${colors.bold}Exemples:${colors.reset}
   /speckit.constitution monorepo typescript avec tests stricts
   /speckit.specify pour un système d'authentification
   /speckit.analyze spec vers plan
   /speckit.help comment créer un workflow personnalisé ?

${colors.bold}Auto-Memory:${colors.reset}
   Vos décisions et learnings sont automatiquement sauvegardés
   dans .spec-kit/memory/ après chaque implémentation

${colors.blue}Documentation: https://github.com/fazzani/smart-spec-kit${colors.reset}
`);
}

main().catch((error) => {
  console.error(`${colors.red}Erreur:${colors.reset}`, error);
  process.exit(1);
});
