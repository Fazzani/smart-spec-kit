/**
 * Workflow Loader v2
 * 
 * Loads workflows and templates with local override support.
 * 
 * Resolution order:
 * 1. Local project: .spec-kit/workflows/ and .spec-kit/templates/
 * 2. Package defaults: /workflows and /templates
 * 
 * This allows any project to customize workflows while using defaults.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import yaml from "js-yaml";
import { WorkflowSchema, type Workflow } from "../schemas/workflowSchema.js";

// Re-export types for external use
export type { Workflow } from "../schemas/workflowSchema.js";

// Directory names
const WORKFLOWS_DIR = "workflows";
const TEMPLATES_DIR = "templates";
const LOCAL_CONFIG_DIR = ".spec-kit";

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
 * Get the current working directory (user's project)
 */
function getProjectRoot(): string {
  return process.cwd();
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all search paths for assets (local first, then package defaults)
 */
function getSearchPaths(assetType: "workflows" | "templates"): string[] {
  const projectRoot = getProjectRoot();
  const packageRoot = getPackageRoot();
  
  const dir = assetType === "workflows" ? WORKFLOWS_DIR : TEMPLATES_DIR;
  
  return [
    // 1. Local project override: .spec-kit/workflows/ or .spec-kit/templates/
    path.join(projectRoot, LOCAL_CONFIG_DIR, dir),
    // 2. Local project root: workflows/ or templates/ (for dedicated spec projects)
    path.join(projectRoot, dir),
    // 3. Package defaults
    path.join(packageRoot, dir),
  ];
}

/**
 * Find a file in search paths
 */
async function findFile(
  assetType: "workflows" | "templates",
  fileName: string
): Promise<string | null> {
  const searchPaths = getSearchPaths(assetType);
  
  for (const basePath of searchPaths) {
    const filePath = path.join(basePath, fileName);
    if (await fileExists(filePath)) {
      return filePath;
    }
  }
  
  return null;
}

/**
 * List files from all search paths (local overrides + package defaults)
 */
async function listFilesFromPaths(
  assetType: "workflows" | "templates",
  extension: string
): Promise<{ name: string; path: string; source: "local" | "package" }[]> {
  const searchPaths = getSearchPaths(assetType);
  const seen = new Set<string>();
  const results: { name: string; path: string; source: "local" | "package" }[] = [];
  
  for (let i = 0; i < searchPaths.length; i++) {
    const basePath = searchPaths[i] as string;
    const isLocal = i < 2; // First two paths are local
    
    try {
      const files = await fs.readdir(basePath);
      for (const file of files) {
        const isYaml = file.endsWith(extension) || file.endsWith(".yml");
        if (isYaml) {
          const name = path.basename(file, path.extname(file));
          const alreadySeen = seen.has(name);
          if (!alreadySeen) {
            seen.add(name);
            results.push({
              name,
              path: path.join(basePath, file),
              source: isLocal ? "local" : "package",
            });
          }
        }
      }
    } catch {
      // Directory doesn't exist, continue
    }
  }
  
  return results;
}

/**
 * List all available workflows (local + package defaults)
 */
export async function listWorkflows(): Promise<string[]> {
  const workflows = await listFilesFromPaths("workflows", ".yaml");
  return workflows.map((w) => w.name);
}

/**
 * List workflows with source information
 */
export async function listWorkflowsDetailed(): Promise<
  { name: string; source: "local" | "package"; path: string }[]
> {
  return listFilesFromPaths("workflows", ".yaml");
}

/**
 * Load and validate a workflow by name
 */
export async function loadWorkflow(workflowName: string): Promise<Workflow> {
  // Try both .yaml and .yml extensions
  let filePath = await findFile("workflows", `${workflowName}.yaml`);
  
  if (!filePath) {
    filePath = await findFile("workflows", `${workflowName}.yml`);
  }
  
  if (!filePath) {
    const available = await listWorkflows();
    throw new Error(
      `Workflow "${workflowName}" not found.\nAvailable workflows: ${available.join(", ") || "none"}\n\nTip: Create custom workflows in .spec-kit/workflows/`
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
  // Add .md extension if not present
  const fileName = templateName.endsWith(".md") ? templateName : `${templateName}.md`;
  
  const filePath = await findFile("templates", fileName);
  
  if (!filePath) {
    throw new Error(
      `Template "${templateName}" not found.\n\nTip: Create custom templates in .spec-kit/templates/`
    );
  }
  
  return await fs.readFile(filePath, "utf-8");
}

/**
 * List all available templates (local + package defaults)
 */
export async function listTemplates(): Promise<string[]> {
  const templates = await listFilesFromPaths("templates", ".md");
  return templates.map((t) => t.name);
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

/**
 * Initialize local spec-kit directory with example files
 */
export async function initLocalConfig(): Promise<void> {
  const projectRoot = getProjectRoot();
  const localDir = path.join(projectRoot, LOCAL_CONFIG_DIR);
  const workflowsDir = path.join(localDir, WORKFLOWS_DIR);
  const templatesDir = path.join(localDir, TEMPLATES_DIR);
  
  // Create directories
  await fs.mkdir(workflowsDir, { recursive: true });
  await fs.mkdir(templatesDir, { recursive: true });
  
  // Create example workflow
  const exampleWorkflow = `# Custom Workflow Example
# This file overrides or extends the default spec-kit workflows.
# See https://github.com/your-org/spec-kit-mcp for documentation.

name: custom-feature
displayName: "Custom Feature Workflow"
description: "Your custom workflow for this project"
template: custom-spec.md
defaultAgent: SpecAgent

steps:
  - id: fetch-requirements
    name: "Fetch Requirements"
    action: fetch_ado
    description: "Retrieve work item from Azure DevOps"
    outputs:
      - workitem

  - id: generate-spec
    name: "Generate Specification"
    action: call_agent
    agent: SpecAgent
    description: "Generate specification document"
    inputs:
      source: workitem
`;

  const exampleTemplate = `# {{title}}

## Context
- **Work Item**: {{contextId}}
- **Date**: {{date}}

## Description
{{description}}

## Requirements
<!-- Generated requirements go here -->

## Technical Notes
<!-- Add your stack-specific notes -->
`;

  const workflowPath = path.join(workflowsDir, "custom-feature.yaml");
  const templatePath = path.join(templatesDir, "custom-spec.md");
  
  // Only create if they don't exist
  if (!(await fileExists(workflowPath))) {
    await fs.writeFile(workflowPath, exampleWorkflow, "utf-8");
  }
  
  if (!(await fileExists(templatePath))) {
    await fs.writeFile(templatePath, exampleTemplate, "utf-8");
  }
}

/**
 * Get configuration info for debugging
 */
export function getConfigInfo(): {
  packageRoot: string;
  projectRoot: string;
  searchPaths: { workflows: string[]; templates: string[] };
} {
  return {
    packageRoot: getPackageRoot(),
    projectRoot: getProjectRoot(),
    searchPaths: {
      workflows: getSearchPaths("workflows"),
      templates: getSearchPaths("templates"),
    },
  };
}
