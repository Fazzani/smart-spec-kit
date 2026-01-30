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

/**
 * Format StepResult into MCP response with auto-prompting
 */
function formatStepResponse(result: Awaited<ReturnType<typeof executeStep>>): string {
  let response = result.userMessage + "\n\n";

  response += "---\n\n";

  if (result.nextAction.type === "workflow_complete") {
    response += "🎉 **Workflow terminé!**\n\n";
  } else if (result.nextAction.type === "error") {
    response += `❌ **Erreur:** ${result.nextAction.description}\n\n`;
  } else {
    response += "## 🤖 Action Suivante\n\n";
    response += `**${result.nextAction.description}**\n\n`;

    if (result.nextAction.requiresApproval) {
      response += "⚠️ *Cette action nécessite votre approbation. Tapez 'OK' ou 'Continuer' pour procéder.*\n\n";
    }

    if (result.nextAction.copilotInstruction) {
      response += "---\n\n";
      response += result.nextAction.copilotInstruction;
    }

    if (result.nextAction.confirmationPrompt) {
      response += "\n\n" + result.nextAction.confirmationPrompt;
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
    `Démarre l'exécution automatique d'un workflow. 
    
Le serveur prend le contrôle et guide Copilot à travers chaque étape.
L'utilisateur n'a qu'à valider les actions proposées.

Workflows disponibles: feature-standard, feature-full, bugfix`,
    {
      workflow_name: z.string().describe("Nom du workflow (ex: 'feature-standard', 'bugfix')"),
      context_id: z.string().describe("Identifiant du contexte - généralement l'ID du work item Azure DevOps"),
    },
    async ({ workflow_name, context_id }) => {
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

        // Start the workflow
        const result = await startWorkflow(workflow_name, context_id);
        const workflow = await loadWorkflow(workflow_name);

        const header = `
# 🚀 Workflow Démarré: ${workflow.displayName}

**Session ID:** \`${result.sessionId}\`
**Context:** \`${context_id}\`
**Étapes:** ${workflow.steps.length}

---

`;
        return {
          content: [{
            type: "text" as const,
            text: header + formatStepResponse(result),
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

        // Execute next step
        const result = await executeStep(sessionId, parsedOutput);

        return {
          content: [{
            type: "text" as const,
            text: formatStepResponse(result),
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
    "Annule le workflow actif et nettoie la session.",
    {
      session_id: z.string().optional().describe("ID de session à annuler (optionnel)"),
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

  // Tool: init - Initialize local spec-kit configuration
  server.tool(
    "init",
    `Initialise la configuration Spec-Kit locale dans le projet courant.
    
Crée le dossier .spec-kit/ avec des exemples de workflows et templates personnalisables.
Utilisez cette commande pour adapter Spec-Kit à votre stack technique.`,
    {},
    async () => {
      try {
        await initLocalConfig();
        const config = getConfigInfo();

        const response = `# ✅ Spec-Kit initialisé!

## Configuration créée

📁 \`.spec-kit/\`
├── 📁 \`workflows/\` - Vos workflows personnalisés
│   └── 📄 \`custom-feature.yaml\` - Exemple de workflow
└── 📁 \`templates/\` - Vos templates personnalisés
    └── 📄 \`custom-spec.md\` - Exemple de template

## Résolution des assets

Les workflows/templates sont recherchés dans cet ordre:
1. **Local**: \`.spec-kit/workflows/\` et \`.spec-kit/templates/\`
2. **Package**: Workflows par défaut (feature-standard, bugfix, etc.)

## Prochaines étapes

1. Éditez \`.spec-kit/workflows/custom-feature.yaml\` selon votre stack
2. Personnalisez \`.spec-kit/templates/custom-spec.md\`
3. Lancez: \`start_workflow workflow_name="custom-feature" context_id="TEST"\`

## Chemins de recherche actuels

- **Projet**: \`${config.projectRoot}\`
- **Package**: \`${config.packageRoot}\`
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
    "config",
    "Affiche la configuration actuelle de Spec-Kit et les chemins de recherche.",
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
