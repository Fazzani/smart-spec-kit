/**
 * Workflow Loader
 * 
 * Loads and validates workflow YAML files from the /workflows directory
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import yaml from "js-yaml";
import { WorkflowSchema, type Workflow } from "../schemas/workflowSchema.js";

// Re-export types for external use
export type { Workflow } from "../schemas/workflowSchema.js";

// Base paths (relative to project root)
const WORKFLOWS_DIR = "workflows";
const TEMPLATES_DIR = "templates";

/**
 * Get the project root directory
 */
function getProjectRoot(): string {
  // In production (dist/), go up one level; in dev (src/), go up two levels
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  // Handle Windows paths (remove leading slash if present)
  const normalizedDir = currentDir.replace(/^\/([A-Za-z]:)/, "$1");
  return path.resolve(normalizedDir, "..", "..");
}

/**
 * List all available workflows
 */
export async function listWorkflows(): Promise<string[]> {
  const workflowsPath = path.join(getProjectRoot(), WORKFLOWS_DIR);
  
  try {
    const files = await fs.readdir(workflowsPath);
    return files
      .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
      .map((file) => path.basename(file, path.extname(file)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

/**
 * Load and validate a workflow by name
 */
export async function loadWorkflow(workflowName: string): Promise<Workflow> {
  const workflowsPath = path.join(getProjectRoot(), WORKFLOWS_DIR);
  
  // Try both .yaml and .yml extensions
  let filePath = path.join(workflowsPath, `${workflowName}.yaml`);
  let fileExists = await fs.access(filePath).then(() => true).catch(() => false);
  
  if (!fileExists) {
    filePath = path.join(workflowsPath, `${workflowName}.yml`);
    fileExists = await fs.access(filePath).then(() => true).catch(() => false);
  }
  
  if (!fileExists) {
    const available = await listWorkflows();
    throw new Error(
      `Workflow "${workflowName}" not found. Available workflows: ${available.join(", ") || "none"}`
    );
  }
  
  // Read and parse YAML
  const content = await fs.readFile(filePath, "utf-8");
  const rawData = yaml.load(content);
  
  // Validate with Zod
  const result = WorkflowSchema.safeParse(rawData);
  
  if (!result.success) {
    const errors = result.error.issues
      .map((e) => `  - ${String(e.path.join("."))}: ${e.message}`)
      .join("\n");
    throw new Error(`Invalid workflow "${workflowName}":\n${errors}`);
  }
  
  return result.data;
}

/**
 * Load a template file by name
 */
export async function loadTemplate(templateName: string): Promise<string> {
  const templatesPath = path.join(getProjectRoot(), TEMPLATES_DIR);
  
  // Add .md extension if not present
  const fileName = templateName.endsWith(".md") ? templateName : `${templateName}.md`;
  const filePath = path.join(templatesPath, fileName);
  
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Template "${templateName}" not found at ${filePath}`);
    }
    throw error;
  }
}

/**
 * Load a workflow with its associated template
 */
export async function loadWorkflowWithTemplate(
  workflowName: string
): Promise<{ workflow: Workflow; template: string }> {
  const workflow = await loadWorkflow(workflowName);
  const template = await loadTemplate(workflow.template);
  
  return { workflow, template };
}

/**
 * Get workflow step by ID
 */
export function getWorkflowStep(workflow: Workflow, stepId: string) {
  return workflow.steps.find((step) => step.id === stepId);
}

/**
 * Get the first step of a workflow
 */
export function getFirstStep(workflow: Workflow) {
  return workflow.steps[0];
}

/**
 * Get the next step in a workflow
 */
export function getNextStep(workflow: Workflow, currentStepId: string) {
  const currentIndex = workflow.steps.findIndex((step) => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex === workflow.steps.length - 1) {
    return null;
  }
  
  const currentStep = workflow.steps[currentIndex];
  
  // Check if there's an explicit next step
  if (currentStep?.next) {
    return getWorkflowStep(workflow, currentStep.next);
  }
  
  // Otherwise return sequential next
  return workflow.steps[currentIndex + 1];
}
