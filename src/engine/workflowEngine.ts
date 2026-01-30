/**
 * Workflow Engine
 * 
 * Orchestrates automatic workflow execution.
 * Each step returns instructions for Copilot to execute the next action.
 */

import {
  loadWorkflow,
  loadTemplate,
  type Workflow,
} from "../utils/workflowLoader.js";
import {
  sessionStore,
  type WorkflowSession,
  type WorkflowData,
} from "./sessionManager.js";
import { getAgent, type AgentType } from "../prompts/agents.js";

/**
 * Result of executing a workflow step
 */
export interface StepResult {
  /** Whether the step completed successfully */
  success: boolean;
  /** Session ID for tracking */
  sessionId: string;
  /** Current step info */
  currentStep: {
    index: number;
    id: string;
    name: string;
  };
  /** Message to display to user */
  userMessage: string;
  /** 
   * Next action for Copilot to execute.
   * This is the KEY for automation - Copilot will execute this instruction.
   */
  nextAction: {
    type: "call_mcp_tool" | "user_confirmation" | "workflow_complete" | "error";
    /** Human-readable description of what will happen */
    description: string;
    /** For call_mcp_tool: the exact instruction for Copilot */
    copilotInstruction?: string;
    /** For user_confirmation: what the user needs to confirm */
    confirmationPrompt?: string;
    /** Is this an automatic action or does it need user approval? */
    requiresApproval: boolean;
  };
  /** Data collected/generated in this step */
  data?: Record<string, unknown>;
}

/**
 * Start a new workflow execution
 */
export async function startWorkflow(
  workflowName: string,
  contextId: string
): Promise<StepResult> {
  // Load workflow definition
  const workflow = await loadWorkflow(workflowName);
  const firstStep = workflow.steps[0];

  if (!firstStep) {
    throw new Error(`Workflow "${workflowName}" has no steps defined`);
  }

  // Create session
  const session = await sessionStore.create(workflowName, contextId, firstStep.id);

  // Generate the first step action
  return generateStepAction(session, workflow, 0);
}

/**
 * Execute the next step in a workflow
 */
export async function executeStep(
  sessionId: string,
  previousOutput?: string | Record<string, unknown>
): Promise<StepResult> {
  const session = sessionStore.get(sessionId);
  if (!session) {
    throw new Error(`Session "${sessionId}" not found. Start a new workflow first.`);
  }

  if (session.status !== "active") {
    throw new Error(`Session "${sessionId}" is ${session.status}, cannot continue.`);
  }

  const workflow = await loadWorkflow(session.workflowName);
  const currentStep = workflow.steps[session.currentStepIndex];

  if (!currentStep) {
    throw new Error(`Invalid step index ${session.currentStepIndex}`);
  }

  // Store the output from previous action
  if (previousOutput) {
    await storeStepOutput(session, currentStep.id, previousOutput);
  }

  // Mark current step as completed
  session.history.push({
    stepId: currentStep.id,
    stepName: currentStep.name,
    status: "completed",
    timestamp: new Date().toISOString(),
    output: typeof previousOutput === "string" ? previousOutput : JSON.stringify(previousOutput),
  });

  // Move to next step
  session.currentStepIndex += 1;

  // Check if workflow is complete
  if (session.currentStepIndex >= workflow.steps.length) {
    session.status = "completed";
    await sessionStore.update(session);

    return {
      success: true,
      sessionId: session.sessionId,
      currentStep: {
        index: session.currentStepIndex - 1,
        id: currentStep.id,
        name: currentStep.name,
      },
      userMessage: generateCompletionMessage(session, workflow),
      nextAction: {
        type: "workflow_complete",
        description: "Workflow terminé avec succès",
        requiresApproval: false,
      },
    };
  }

  // Update session with new step
  const nextStep = workflow.steps[session.currentStepIndex];
  if (nextStep) {
    session.currentStepId = nextStep.id;
  }
  await sessionStore.update(session);

  // Generate action for next step
  return generateStepAction(session, workflow, session.currentStepIndex);
}

/**
 * Get current session status
 */
export async function getSessionStatus(sessionId?: string): Promise<{
  session: WorkflowSession | null;
  summary: string;
}> {
  const session = sessionId 
    ? sessionStore.get(sessionId) 
    : sessionStore.getActiveSession();

  if (!session) {
    return {
      session: null,
      summary: "Aucune session active. Utilisez `start_workflow` pour démarrer.",
    };
  }

  const workflow = await loadWorkflow(session.workflowName);
  const currentStep = workflow.steps[session.currentStepIndex];

  return {
    session,
    summary: `
**Session:** ${session.sessionId}
**Workflow:** ${workflow.displayName}
**Context:** ${session.contextId}
**Status:** ${session.status}
**Progression:** ${session.currentStepIndex + 1}/${workflow.steps.length}
**Étape actuelle:** ${currentStep?.name ?? "Terminé"}
    `.trim(),
  };
}

/**
 * Generate the action for a specific step
 */
async function generateStepAction(
  session: WorkflowSession,
  workflow: Workflow,
  stepIndex: number
): Promise<StepResult> {
  const step = workflow.steps[stepIndex];
  if (!step) {
    throw new Error(`Step index ${stepIndex} out of bounds`);
  }

  const progressInfo = `[${stepIndex + 1}/${workflow.steps.length}]`;

  switch (step.action) {
    case "fetch_ado":
      return {
        success: true,
        sessionId: session.sessionId,
        currentStep: { index: stepIndex, id: step.id, name: step.name },
        userMessage: `
## 🔄 ${progressInfo} ${step.name}

${step.description}

**Action automatique:** Je vais récupérer les données depuis Azure DevOps.
        `.trim(),
        nextAction: {
          type: "call_mcp_tool",
          description: "Récupération du work item Azure DevOps",
          requiresApproval: true,
          copilotInstruction: `
**INSTRUCTION POUR COPILOT:**

Exécute cette action puis rappelle-moi avec le résultat:

1. Utilise l'outil \`azure-devops\` → \`get_work_item\` avec l'ID: \`${session.contextId}\`
2. Une fois le résultat obtenu, appelle \`spec-kit\` → \`execute_step\` avec:
   - sessionId: "${session.sessionId}"
   - previousOutput: [LE JSON DU WORK ITEM]

\`\`\`
Commande: Récupère le work item #${session.contextId} depuis Azure DevOps
\`\`\`
          `.trim(),
        },
      };

    case "generate_content":
    case "call_agent":
      const agent = getAgent((step.agent ?? workflow.defaultAgent) as AgentType);
      const template = await loadTemplate(workflow.template);
      
      return {
        success: true,
        sessionId: session.sessionId,
        currentStep: { index: stepIndex, id: step.id, name: step.name },
        userMessage: `
## 🤖 ${progressInfo} ${step.name}

${step.description}

**Agent:** ${agent.displayName}
**Action:** Génération automatique en cours...
        `.trim(),
        nextAction: {
          type: "call_mcp_tool",
          description: `Génération avec ${agent.displayName}`,
          requiresApproval: true,
          copilotInstruction: generateAgentInstruction(session, step, agent, template),
        },
      };

    case "review":
      const reviewAgent = getAgent((step.agent ?? "GovAgent") as AgentType);
      
      return {
        success: true,
        sessionId: session.sessionId,
        currentStep: { index: stepIndex, id: step.id, name: step.name },
        userMessage: `
## ✅ ${progressInfo} ${step.name}

${step.description}

**Agent:** ${reviewAgent.displayName}
**Action:** Validation en cours...
        `.trim(),
        nextAction: {
          type: "call_mcp_tool",
          description: `Validation avec ${reviewAgent.displayName}`,
          requiresApproval: true,
          copilotInstruction: generateReviewInstruction(session, step, reviewAgent),
        },
      };

    case "create_file":
      return {
        success: true,
        sessionId: session.sessionId,
        currentStep: { index: stepIndex, id: step.id, name: step.name },
        userMessage: `
## 📄 ${progressInfo} ${step.name}

${step.description}

**Action:** Création du fichier de spécification.
        `.trim(),
        nextAction: {
          type: "user_confirmation",
          description: "Création du fichier de sortie",
          requiresApproval: true,
          confirmationPrompt: `
Voulez-vous créer le fichier de spécification ?

**Fichier:** \`specs/${session.contextId}-spec.md\`

Répondez "oui" pour créer le fichier, ou "modifier" pour ajuster le contenu d'abord.
          `.trim(),
          copilotInstruction: `
**INSTRUCTION POUR COPILOT:**

Demande à l'utilisateur de confirmer la création du fichier.
Si confirmé, crée le fichier avec le contenu de la spécification générée.
Puis appelle \`spec-kit\` → \`execute_step\` avec:
- sessionId: "${session.sessionId}"
- previousOutput: { "fileCreated": true, "path": "specs/${session.contextId}-spec.md" }
          `.trim(),
        },
      };

    default:
      return {
        success: false,
        sessionId: session.sessionId,
        currentStep: { index: stepIndex, id: step.id, name: step.name },
        userMessage: `Action inconnue: ${step.action}`,
        nextAction: {
          type: "error",
          description: `Type d'action non supporté: ${step.action}`,
          requiresApproval: false,
        },
      };
  }
}

/**
 * Generate instruction for agent-based content generation
 */
function generateAgentInstruction(
  session: WorkflowSession,
  step: { id: string; name: string; description: string },
  agent: { name: string; displayName: string; systemPrompt: string },
  template: string
): string {
  const workItemData = session.data.workItemData 
    ? JSON.stringify(session.data.workItemData, null, 2)
    : "[Données non disponibles - récupérez d'abord le work item]";

  return `
**INSTRUCTION POUR COPILOT:**

Tu es maintenant **${agent.displayName}**. Exécute cette tâche:

---
## System Prompt
${agent.systemPrompt}
---

## Tâche: ${step.name}
${step.description}

## Données du Work Item
\`\`\`json
${workItemData}
\`\`\`

## Template à utiliser
\`\`\`markdown
${template.slice(0, 1500)}
${template.length > 1500 ? "\n[...template tronqué...]" : ""}
\`\`\`

## Instructions
1. Génère le contenu en suivant le template
2. Remplis les sections avec les données du work item
3. Marque les sections incertaines avec [TO FILL]
4. Une fois terminé, appelle \`spec-kit\` → \`execute_step\` avec:
   - sessionId: "${session.sessionId}"
   - previousOutput: [LE CONTENU MARKDOWN GÉNÉRÉ]
  `.trim();
}

/**
 * Generate instruction for review steps
 */
function generateReviewInstruction(
  session: WorkflowSession,
  step: { id: string; name: string; description: string },
  agent: { name: string; displayName: string; systemPrompt: string }
): string {
  const contentToReview = session.data.specification 
    ?? session.data.technicalPlan 
    ?? "[Contenu à reviewer non disponible]";

  return `
**INSTRUCTION POUR COPILOT:**

Tu es maintenant **${agent.displayName}**. Effectue cette revue:

---
## System Prompt
${agent.systemPrompt}
---

## Tâche: ${step.name}
${step.description}

## Contenu à valider
\`\`\`markdown
${typeof contentToReview === "string" ? contentToReview.slice(0, 2000) : JSON.stringify(contentToReview).slice(0, 2000)}
\`\`\`

## Instructions
1. Analyse le contenu selon les critères de validation
2. Liste les points conformes ✅
3. Liste les problèmes à corriger ❌
4. Donne un verdict: APPROVED / NEEDS_WORK / REJECTED
5. Appelle \`spec-kit\` → \`execute_step\` avec:
   - sessionId: "${session.sessionId}"
   - previousOutput: { "status": "[VERDICT]", "issues": [...], "recommendations": [...] }
  `.trim();
}

/**
 * Store output from a step into session data
 */
async function storeStepOutput(
  session: WorkflowSession,
  stepId: string,
  output: string | Record<string, unknown>
): Promise<void> {
  // Parse output based on step type
  if (stepId.includes("fetch") || stepId.includes("ado")) {
    session.data.workItemData = typeof output === "string" 
      ? JSON.parse(output) 
      : output;
  } else if (stepId.includes("spec") || stepId.includes("generate")) {
    session.data.specification = typeof output === "string" 
      ? output 
      : JSON.stringify(output, null, 2);
  } else if (stepId.includes("plan")) {
    session.data.technicalPlan = typeof output === "string"
      ? output
      : JSON.stringify(output, null, 2);
  } else if (stepId.includes("review") || stepId.includes("valid")) {
    const validationType = stepId.includes("rgpd") ? "rgpd"
      : stepId.includes("security") ? "security"
      : stepId.includes("arch") ? "architecture"
      : stepId.includes("design") ? "design"
      : "general";
    
    if (!session.data.validations) {
      session.data.validations = {};
    }
    
    const validationData = typeof output === "string" 
      ? { status: "completed", issues: [], raw: output }
      : output;
    
    session.data.validations[validationType] = validationData as { status: string; issues: string[] };
  }

  await sessionStore.update(session);
}

/**
 * Generate completion message
 */
function generateCompletionMessage(session: WorkflowSession, workflow: Workflow): string {
  const stepsCompleted = session.history.length;
  const validations = session.data.validations ?? {};

  return `
# ✅ Workflow "${workflow.displayName}" Terminé!

## Résumé
- **Context ID:** ${session.contextId}
- **Étapes complétées:** ${stepsCompleted}/${workflow.steps.length}
- **Durée:** ${calculateDuration(session.createdAt, session.updatedAt)}

## Artefacts générés
${session.data.specification ? "- ✅ Spécification fonctionnelle" : ""}
${session.data.technicalPlan ? "- ✅ Plan technique" : ""}
${Object.keys(validations).length > 0 ? `- ✅ Validations: ${Object.keys(validations).join(", ")}` : ""}

## Prochaines étapes suggérées
1. Revoir le fichier de spécification généré
2. Créer les tâches dans Azure DevOps
3. Assigner les tâches à l'équipe

---
*Session ID: ${session.sessionId}*
  `.trim();
}

/**
 * Calculate human-readable duration
 */
function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "< 1 minute";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""}`;
  
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}
