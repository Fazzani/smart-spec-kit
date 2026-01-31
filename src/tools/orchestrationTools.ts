/**
 * Orchestration Tools
 * 
 * MCP tools for automated workflow orchestration.
 * These tools drive the workflow engine and return instructions for Copilot.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as path from "node:path";
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
import { detectStack } from "../utils/stackDetector.js";
import { updateConstitution } from "../utils/constitutionUpdater.js";
import { initGuidedSessionStore } from "../utils/initGuidedSessionStore.js";
import {
  buildInitQuestions,
  getTodayDate,
  normalizeGuidedAnswer,
  type InitQuestion,
} from "../utils/initGuidedFlow.js";

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

function buildInstallPreface(
  status: {
    hasPrompts: boolean;
    hasTemplates: boolean;
    hasMemory: boolean;
    hasSpecs: boolean;
  },
  force: boolean | undefined,
  guided: boolean | undefined
): { preface: string; shouldReturn: boolean } {
  const alreadyInstalled = status.hasPrompts || status.hasTemplates;
  if (!alreadyInstalled || force) {
    return { preface: "", shouldReturn: false };
  }

  let preface = "# ⚠️ Spec-Kit semble déjà installé\n\n";
  preface += "Éléments détectés:\n";
  if (status.hasPrompts) preface += "- ✅ `.github/prompts/` existe\n";
  if (status.hasTemplates) preface += "- ✅ `.spec-kit/templates/` existe\n";
  if (status.hasMemory) preface += "- ✅ `.spec-kit/memory/` existe\n";
  if (status.hasSpecs) preface += "- ✅ `specs/` existe\n";
  preface += "\nUtilisez `init` avec `force: true` pour réinstaller.\n\n";

  return { preface, shouldReturn: !guided };
}

function buildGuidedQuestionPrompt(
  sessionId: string,
  question: InitQuestion,
  index: number,
  total: number
): string {
  let prompt = `# 🧭 Init guidé (${index + 1}/${total})\n\n`;
  prompt += `**Question**: ${question.label}\n`;
  if (question.suggestion) {
    prompt += `**Suggestion**: ${question.suggestion}\n`;
  }
  prompt += "\nRépondez avec:\n";
  prompt += `- \`speckit: init guided=true session_id=${sessionId} answer="..."\`\n`;
  if (question.suggestion) {
    prompt += `- \`speckit: init guided=true session_id=${sessionId} answer="auto"\` (utiliser la suggestion)\n`;
  }
  prompt += `- \`speckit: init guided=true session_id=${sessionId} answer="skip"\` (ignorer)\n`;
  prompt += `- \`speckit: init guided=true session_id=${sessionId} cancel=true\` (annuler)\n`;
  return prompt;
}

function findNextQuestionIndex(
  questions: InitQuestion[],
  answers: Record<string, string | undefined>,
  skippedKeys: Set<string>,
  startIndex: number
): number {
  for (let i = startIndex; i < questions.length; i += 1) {
    const question = questions[i];
    if (!question) return questions.length;
    const key = question.key as string;
    const isFilled = Boolean(answers[key]) || skippedKeys.has(key);
    if (!isFilled) return i;
  }
  return questions.length;
}

async function buildGuidedInitReport(
  projectPath: string,
  answers: {
    projectName?: string;
    ratificationDate?: string;
    lastAmended?: string;
    language?: string;
    framework?: string;
    database?: string;
    testing?: string;
    codeStyle?: string;
    approvers?: string;
  } | undefined,
  title: string,
  detectionOverride?: Awaited<ReturnType<typeof detectStack>>
): Promise<string> {
  const detection = detectionOverride ?? await detectStack(projectPath);
  const updateResult = await updateConstitution(projectPath, detection, answers ?? {});

  let report = `\n## ${title}\n\n`;
  report += "### Détection de stack\n";
  report += `- Langage: ${detection.language ?? "Non détecté"}\n`;
  report += `- Framework: ${detection.framework ?? "Non détecté"}\n`;
  report += `- Base de données: ${detection.database ?? "Non détectée"}\n`;
  report += `- Tests: ${detection.testing ?? "Non détectés"}\n`;
  report += `- Style de code: ${detection.codeStyle ?? "Non détecté"}\n`;
  if (detection.evidence.length > 0) {
    report += `- Preuves: ${detection.evidence.join(", ")}\n`;
  }

  report += "\n### Constitution\n";
  if (updateResult.updated) {
    report += `✅ constitution.md mise à jour: ${path.relative(projectPath, updateResult.filePath)}\n`;
  } else {
    report += "ℹ️ Aucune modification appliquée à constitution.md\n";
  }

  if (updateResult.remainingPlaceholders.length > 0) {
    report += "\n### Champs à compléter\n";
    const unique = Array.from(new Set(updateResult.remainingPlaceholders));
    for (const placeholder of unique) {
      report += `- ${placeholder}\n`;
    }
    report += "\nAstuce: relancez `init` avec `guided: true` et `answers` pour compléter ces champs.\n";
  }

  return report;
}

async function handleGuidedInit(
  projectPath: string,
  params: {
    force?: boolean;
    answers?: {
      projectName?: string;
      ratificationDate?: string;
      lastAmended?: string;
      language?: string;
      framework?: string;
      database?: string;
      testing?: string;
      codeStyle?: string;
      approvers?: string;
    };
  }
): Promise<string> {
  const detection = await detectStack(projectPath);
  const today = getTodayDate();
  
  // Step 1: If no answers provided, show all questions
  if (!params.answers) {
    const questions = buildInitQuestions(projectPath, detection, today);
    
    let prompt = "# 🧭 Initialisation guidée - Compléter la constitution\n\n";
    prompt += "## Valeurs pré-remplies (optionnelles)\n\n";
    prompt += `Basées sur la détection automatique du projet:\n\n`;
    prompt += `- **Langage**: ${detection.language ?? "Non détecté"}\n`;
    prompt += `- **Framework**: ${detection.framework ?? "Non détecté"}\n`;
    prompt += `- **Base de données**: ${detection.database ?? "Non détectée"}\n`;
    prompt += `- **Tests**: ${detection.testing ?? "Non détectés"}\n`;
    prompt += `- **Style de code**: ${detection.codeStyle ?? "Non détecté"}\n\n`;
    
    prompt += "## Questions à remplir\n\n";
    prompt += "Répondez à TOUTES les questions ci-dessous. Vous pouvez utiliser les valeurs détectées ou les personnaliser :\n\n";
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q) continue;
      prompt += `**${i + 1}. ${q.label}**\n`;
      if (q.suggestion) {
        prompt += `   💡 Suggestion: \`${q.suggestion}\`\n`;
      }
      prompt += "\n";
    }
    
    prompt += "## Comment répondre\n\n";
    prompt += "Une fois que vous avez vos réponses, appelez:\n\n";
    prompt += "```\nspeckit: init guided=true answers={\n";
    prompt += '  "projectName": "ViPlayer",\n';
    prompt += '  "ratificationDate": "2026-01-31",\n';
    prompt += '  "lastAmended": "2026-01-31",\n';
    prompt += '  "language": "Dart",\n';
    prompt += '  "framework": "Flutter 3.x",\n';
    prompt += '  "database": "Hive (Local) + Firebase Firestore (Cloud)",\n';
    prompt += '  "testing": "Mockito, Flutter Test, Riverpod Test Containers",\n';
    prompt += '  "codeStyle": "Dart Style Guide, Clean Architecture, Riverpod State Management",\n';
    prompt += '  "approvers": "Tech Lead"\n';
    prompt += "}\n```\n\n";
    prompt += "Ou personnalisez avec vos propres valeurs.\n";
    
    return prompt;
  }
  
  // Step 2: Process answers and complete installation
  const status = await isSpecKitInstalled(projectPath);
  const { preface } = buildInstallPreface(status, params.force, true);
  const installResult = await installStarterKit(projectPath, { force: params.force ?? false });
  const report = formatInstallReport(installResult, projectPath);
  const constitutionReport = await buildGuidedInitReport(
    projectPath,
    params.answers,
    "📝 Constitution mise à jour avec vos réponses",
    detection
  );

  return `${preface}${report}${constitutionReport}`;
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
      guided: z.boolean().optional().describe("Active l'initialisation guidée avec toutes les questions en une fois"),
      answers: z
        .object({
          projectName: z.string().optional().describe("Nom du projet"),
          ratificationDate: z.string().optional().describe("Date de ratification (YYYY-MM-DD)"),
          lastAmended: z.string().optional().describe("Dernière mise à jour (YYYY-MM-DD)"),
          language: z.string().optional().describe("Langage principal"),
          framework: z.string().optional().describe("Framework principal"),
          database: z.string().optional().describe("Base de données"),
          testing: z.string().optional().describe("Outils de test"),
          codeStyle: z.string().optional().describe("Conventions de style de code"),
          approvers: z.string().optional().describe("Qui approuve les changements de constitution"),
        })
        .partial()
        .optional()
        .describe("Réponses pour compléter la constitution (mode guidé)"),
    },
    async ({ force, guided, answers }) => {
      try {
        const projectPath = process.cwd();

        if (guided === undefined) {
          const prompt = "# ✅ Choix du mode d'initialisation\n\n" +
            "Souhaitez-vous un mode **guidé** (questions/réponses) ou **auto** (détection depuis le projet) ?\n\n" +
            "Répondez en relançant `init` avec:\n" +
            "- `guided: true` pour le mode guidé\n" +
            "- `guided: false` pour le mode auto\n\n" +
            "Exemples:\n" +
            "- `speckit: init guided=true`\n" +
            "- `speckit: init guided=false`\n";

          return {
            content: [{
              type: "text" as const,
              text: prompt,
            }],
          };
        }

        if (guided) {
          const guidedText = await handleGuidedInit(projectPath, {
            force,
            answers,
          });

          return {
            content: [{
              type: "text" as const,
              text: guidedText,
            }],
          };
        }
        
        // Check if already installed
        const status = await isSpecKitInstalled(projectPath);
        const { preface, shouldReturn } = buildInstallPreface(status, force, guided);
        
        // Auto mode: check constitution even if already installed
        if (shouldReturn && !force) {
          // Try to update constitution with detection
          const guidedReport = await buildGuidedInitReport(
            projectPath,
            answers,
            "🔍 Vérification de la constitution"
          );
          
          return {
            content: [{
              type: "text" as const,
              text: `${preface}${guidedReport}`,
            }],
          };
        }

        // Install the starter kit (if not already installed or force=true)
        const result = await installStarterKit(projectPath, { force: force ?? false });
        const report = formatInstallReport(result, projectPath);
        const guidedReport = await buildGuidedInitReport(
          projectPath,
          answers,
          "⚙️ Initialisation auto (constitution)"
        );

        return {
          content: [{
            type: "text" as const,
            text: `${preface}${report}${guidedReport}`,
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
