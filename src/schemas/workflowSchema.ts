/**
 * Workflow Schema Definitions
 * 
 * Zod schemas for validating workflow YAML files
 */

import { z } from "zod";

/**
 * Schema for a single workflow step
 */
export const WorkflowStepSchema = z.object({
  id: z.string().describe("Unique identifier for the step"),
  name: z.string().describe("Human-readable step name"),
  action: z.enum(["fetch_ado", "generate_content", "review", "create_file", "call_agent"])
    .describe("The type of action to perform"),
  description: z.string().describe("Detailed description of what this step does"),
  agent: z.string().optional().describe("Agent to use for this step (e.g., SpecAgent, PlanAgent)"),
  inputs: z.record(z.string(), z.string()).optional().describe("Input parameters for the step"),
  outputs: z.array(z.string()).optional().describe("Expected outputs from this step"),
  next: z.string().optional().describe("Next step ID (if not sequential)"),
});

/**
 * Schema for workflow metadata
 */
export const WorkflowMetadataSchema = z.object({
  version: z.string().default("1.0"),
  author: z.string().optional(),
  created: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Schema for a complete workflow definition
 */
export const WorkflowSchema = z.object({
  name: z.string().describe("Workflow identifier"),
  displayName: z.string().describe("Human-readable workflow name"),
  description: z.string().describe("What this workflow accomplishes"),
  metadata: WorkflowMetadataSchema.optional(),
  template: z.string().describe("Associated template file (e.g., functional-spec.md)"),
  defaultAgent: z.string().default("SpecAgent").describe("Default agent for this workflow"),
  steps: z.array(WorkflowStepSchema).min(1).describe("Ordered list of workflow steps"),
});

// Type exports
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type WorkflowMetadata = z.infer<typeof WorkflowMetadataSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
