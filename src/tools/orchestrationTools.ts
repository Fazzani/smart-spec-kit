/**
 * Orchestration Tools
 * 
 * MCP tools for automated workflow orchestration.
 * These tools drive the workflow engine and return instructions for Copilot.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  startWorkflow,
  executeStep,
  getSessionStatus,
} from "../engine/workflowEngine.js";
import { sessionStore } from "../engine/sessionManager.js";
import { 
  listWorkflows, 
  listWorkflowsDetailed,
  loadWorkflow, 
  initLocalConfig,
  getConfigInfo,
} from "../utils/workflowLoader.js";
import {
  installStarterKit,
  formatInstallReport,
  isSpecKitInstalled,
} from "../utils/starterKitInstaller.js";

/**
 * Format StepResult into MCP response with auto-prompting
 */
function formatStepResponse(result: Awaited<ReturnType<typeof executeStep>>, autoMode: boolean = false): string {
  let response = result.userMessage + "\n\n";

  response += "---\n\n";

  if (result.nextAction.type === "workflow_complete") {
    response += "🎉 **Workflow terminé!**\n\n";
  } else if (result.nextAction.type === "error") {
    response += `❌ **Erreur:** ${result.nextAction.description}\n\n`;
  } else {
    response += "## 🤖 Action Suivante\n\n";
    response += `**${result.nextAction.description}**\n\n`;

    if (autoMode) {
      response += "🚀 **Mode AUTO activé** - Passage automatique à l'étape suivante...\n\n";
    } else if (result.nextAction.requiresApproval) {
      response += "⚠️ *Cette action nécessite votre approbation. Tapez 'OK' ou 'Continuer' pour procéder.*\n\n";
    }

    if (result.nextAction.copilotInstruction) {
      response += "---\n\n";
      response += result.nextAction.copilotInstruction;
    }

    if (result.nextAction.confirmationPrompt && !autoMode) {
      response += "\n\n" + result.nextAction.confirmationPrompt;
    }

    // In auto mode, add instruction to continue immediately
    if (autoMode) {
      response += "\n\n---\n\n**⚡ AUTO MODE:** Exécutez immédiatement l'action ci-dessus puis appelez `execute_step` pour continuer.";
    }
  }

  return response;
}

/**
 * Register orchestration tools on the MCP server
 */
export function registerOrchestrationTools(server: McpServer): void {

  // Tool: start_workflow - Start automated workflow execution
  server.tool(
    "start_workflow",
    `Démarre l'exécution automatique d'un workflow multi-étapes. 
    
Le serveur prend le contrôle et guide Copilot à travers chaque étape.
L'utilisateur n'a qu'à valider les actions proposées.

Workflows disponibles: feature-standard, feature-full, bugfix

Note: Les workflows sont optionnels. Pour une utilisation simple, préférez les commandes directes:
- speckit: spec
- speckit: plan
- speckit: tasks
- speckit: implement`,
    {
      workflow_name: z.string().describe("Nom du workflow (ex: 'feature-standard', 'bugfix')"),
      context_id: z.string().optional().describe("Identifiant optionnel du contexte - peut être l'ID d'un work item Azure DevOps ou une description courte"),
      auto: z.boolean().optional().default(false).describe("Mode automatique - enchaîne les étapes sans demander d'approbation (défaut: false)"),
    },
    async ({ workflow_name, context_id, auto }) => {
      try {
        // Validate workflow exists
        const workflows = await listWorkflows();
        if (!workflows.includes(workflow_name)) {
          return {
            content: [{
              type: "text" as const,
              text: `❌ Workflow "${workflow_name}" non trouvé.\n\nWorkflows disponibles:\n${workflows.map(w => `- ${w}`).join("\n")}`,
            }],
            isError: true,
          };
        }

        // Generate context_id if not provided
        const effectiveContextId = context_id || `session-${Date.now()}`;
        const autoMode = auto ?? false;

        // Start the workflow
        const result = await startWorkflow(workflow_name, effectiveContextId, autoMode);
        const workflow = await loadWorkflow(workflow_name);

        const header = `
# 🚀 Workflow Démarré: ${workflow.displayName}

**Session ID:** \`${result.sessionId}\`
${context_id ? `**Context:** \`${context_id}\`` : ""}
${autoMode ? "**Mode:** 🚀 AUTO (enchaînement automatique)" : "**Mode:** Manuel (approbation requise)"}
**Étapes:** ${workflow.steps.length}

---

`;
        return {
          content: [{
            type: "text" as const,
            text: header + formatStepResponse(result, autoMode),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Erreur au démarrage: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: execute_step - Continue workflow execution
  server.tool(
    "execute_step",
    `Continue l'exécution du workflow actif.

Appeler cet outil après chaque action complétée pour passer à l'étape suivante.
Fournir le résultat de l'action précédente dans 'previous_output'.`,
    {
      session_id: z.string().optional().describe("ID de session (optionnel si une seule session active)"),
      previous_output: z.string().optional().describe("Résultat de l'action précédente (JSON ou texte)"),
    },
    async ({ session_id, previous_output }) => {
      try {
        // Get session
        let sessionId = session_id;
        if (!sessionId) {
          const active = sessionStore.getActiveSession();
          if (!active) {
            return {
              content: [{
                type: "text" as const,
                text: "❌ Aucune session active. Utilisez `start_workflow` pour démarrer.",
              }],
              isError: true,
            };
          }
          sessionId = active.sessionId;
        }

        // Parse previous output if JSON
        let parsedOutput: string | Record<string, unknown> | undefined;
        if (previous_output) {
          try {
            parsedOutput = JSON.parse(previous_output);
          } catch {
            parsedOutput = previous_output;
          }
        }

        // Get session to check autoMode
        const session = sessionStore.get(sessionId);
        const autoMode = session?.autoMode ?? false;

        // Execute next step
        const result = await executeStep(sessionId, parsedOutput);

        return {
          content: [{
            type: "text" as const,
            text: formatStepResponse(result, autoMode),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Erreur d'exécution: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: workflow_status - Get current workflow status
  server.tool(
    "workflow_status",
    "Affiche le statut de la session de workflow active ou spécifiée.",
    {
      session_id: z.string().optional().describe("ID de session (optionnel)"),
    },
    async ({ session_id }) => {
      try {
        const { session, summary } = await getSessionStatus(session_id);

        if (!session) {
          return {
            content: [{
              type: "text" as const,
              text: summary,
            }],
          };
        }

        let response = `# 📊 Statut du Workflow\n\n${summary}\n\n`;

        if (session.history.length > 0) {
          response += "## Historique\n\n";
          for (const entry of session.history) {
            const icon = entry.status === "completed" ? "✅" : entry.status === "skipped" ? "⏭️" : "❌";
            response += `${icon} ${entry.stepName}\n`;
          }
        }

        if (session.pendingAction) {
          response += `\n## Action en attente\n\n${session.pendingAction.instruction}`;
        }

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
            text: `❌ Erreur: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: list_workflows - List available workflows
  server.tool(
    "list_workflows",
    "Liste tous les workflows disponibles avec leurs descriptions.",
    {},
    async () => {
      try {
        const workflowNames = await listWorkflows();

        if (workflowNames.length === 0) {
          return {
            content: [{
              type: "text" as const,
              text: "Aucun workflow trouvé dans le dossier /workflows.",
            }],
          };
        }

        let response = "# 📋 Workflows Disponibles\n\n";

        for (const name of workflowNames) {
          try {
            const wf = await loadWorkflow(name);
            response += `## ${wf.displayName}\n`;
            response += `**Commande:** \`start_workflow("${name}", "<work_item_id>")\`\n\n`;
            response += `${wf.description}\n\n`;
            response += `**Étapes:** ${wf.steps.length}\n`;
            response += `**Template:** ${wf.template}\n\n`;
            response += "---\n\n";
          } catch {
            response += `## ${name}\n*Erreur de chargement*\n\n---\n\n`;
          }
        }

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
            text: `❌ Erreur: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: abort_workflow - Cancel active workflow
  server.tool(
    "abort_workflow",
    `Annule et supprime le workflow en cours d'exécution.
    
Utilisez cet outil uniquement pour ANNULER un workflow, pas pour l'initialiser.
Pour initialiser spec-kit, utilisez l'outil 'init' à la place.`,
    {
      session_id: z.string().optional().describe("ID de session à annuler. Laissez vide pour annuler la session active."),
    },
    async ({ session_id }) => {
      try {
        let sessionId = session_id;
        if (!sessionId) {
          const active = sessionStore.getActiveSession();
          if (!active) {
            return {
              content: [{
                type: "text" as const,
                text: "Aucune session active à annuler.",
              }],
            };
          }
          sessionId = active.sessionId;
        }

        await sessionStore.delete(sessionId);

        return {
          content: [{
            type: "text" as const,
            text: `✅ Session \`${sessionId}\` annulée et supprimée.`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Erreur: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: init - Initialize Spec-Kit starter kit in the project
  server.tool(
    "init",
    `INITIALISE le Starter Kit Spec-Kit dans le projet courant.
    
Installe:
- .github/prompts/ : Slash commands pour VS Code Copilot (/speckit.specify, /speckit.plan, etc.)
- .spec-kit/templates/ : Templates de spécifications
- .spec-kit/memory/ : Constitution et contexte projet
- specs/ : Dossier pour les spécifications générées

Utiliser cet outil quand l'utilisateur veut:
- Initialiser spec-kit dans son projet
- Installer les slash commands Copilot
- Mettre en place le développement spec-driven`,
    {
      force: z.boolean().optional().describe("Écraser les fichiers existants (défaut: false)"),
    },
    async ({ force }) => {
      try {
        const projectPath = process.cwd();
        
        // Check if already installed
        const status = await isSpecKitInstalled(projectPath);
        const alreadyInstalled = status.hasPrompts || status.hasTemplates;
        
        if (alreadyInstalled && !force) {
          let message = "# ⚠️ Spec-Kit semble déjà installé\n\n";
          message += "Éléments détectés:\n";
          if (status.hasPrompts) message += "- ✅ `.github/prompts/` existe\n";
          if (status.hasTemplates) message += "- ✅ `.spec-kit/templates/` existe\n";
          if (status.hasMemory) message += "- ✅ `.spec-kit/memory/` existe\n";
          if (status.hasSpecs) message += "- ✅ `specs/` existe\n";
          message += "\nUtilisez `init` avec `force: true` pour réinstaller.";
          
          return {
            content: [{
              type: "text" as const,
              text: message,
            }],
          };
        }

        // Install the starter kit
        const result = await installStarterKit(projectPath, { force: force ?? false });
        const report = formatInstallReport(result, projectPath);

        return {
          content: [{
            type: "text" as const,
            text: report,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Erreur d'installation: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: init_project - Initialize local spec-kit configuration (legacy, for custom workflows)
  server.tool(
    "init_project",
    `Initialise la configuration locale pour PERSONNALISER les workflows (avancé).
    
Crée .spec-kit/ avec des exemples de workflows personnalisés.
Pour une installation standard, utilisez l'outil 'init' à la place.`,
    {},
    async () => {
      try {
        await initLocalConfig();

        const response = `# ✅ Configuration locale créée!

## Dossier créé

📁 \`.spec-kit/\`
├── 📁 \`workflows/\` - Workflows personnalisés
│   └── 📄 \`custom-feature.yaml\` - Exemple
└── 📁 \`templates/\` - Templates personnalisés
    └── 📄 \`custom-spec.md\` - Exemple

## Prochaines étapes

1. Éditez les fichiers selon votre stack technique
2. Les workflows locaux ont priorité sur les défauts

**Conseil**: Utilisez \`init\` pour installer le starter kit complet avec slash commands.
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
            text: `❌ Erreur: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: config - Show current configuration
  server.tool(
    "show_config",
    `Affiche la configuration actuelle de Spec-Kit.
    
Montre:
- Les chemins de recherche des workflows
- Les chemins de recherche des templates  
- La liste des workflows disponibles (locaux et package)`,
    {},
    async () => {
      try {
        const config = getConfigInfo();
        const workflows = await listWorkflowsDetailed();

        let workflowList = "";
        for (const w of workflows) {
          const icon = w.source === "local" ? "📍" : "📦";
          workflowList += `- ${icon} \`${w.name}\` (${w.source})\n`;
        }

        const response = `# ⚙️ Configuration Spec-Kit

## Chemins

| Type | Chemin |
|------|--------|
| Projet courant | \`${config.projectRoot}\` |
| Package Spec-Kit | \`${config.packageRoot}\` |

## Recherche des workflows

${config.searchPaths.workflows.map((p, i) => `${i + 1}. \`${p}\``).join("\n")}

## Recherche des templates

${config.searchPaths.templates.map((p, i) => `${i + 1}. \`${p}\``).join("\n")}

## Workflows disponibles

${workflowList || "Aucun workflow trouvé"}

## Légende
- 📍 Local (override)
- 📦 Package (défaut)
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
            text: `❌ Erreur: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    }
  );
}
