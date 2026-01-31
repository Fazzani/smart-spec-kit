/**
 * Constitution Updater
 * 
 * Fills .spec-kit/memory/constitution.md using detected stack and user answers.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { StackDetection } from "./stackDetector.js";

export interface ConstitutionAnswers {
  projectName?: string;
  ratificationDate?: string;
  lastAmended?: string;
  language?: string;
  framework?: string;
  database?: string;
  testing?: string;
  codeStyle?: string;
  approvers?: string;
}

export interface ConstitutionUpdateResult {
  updated: boolean;
  filePath: string;
  remainingPlaceholders: string[];
  applied: Record<string, string>;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function replaceLabelValue(content: string, label: string, value?: string): { content: string; applied?: string } {
  if (!value) return { content };
  const labelPattern = new RegExp(String.raw`(-\s*\*\*${label}\*\*:\s*)(.+)`);
  if (labelPattern.test(content)) {
    return { content: content.replace(labelPattern, `$1${value}`), applied: value };
  }
  return { content };
}

function replaceLabelPlaceholder(content: string, label: string, value?: string): { content: string; applied?: string } {
  if (!value) return { content };
  const placeholderPattern = new RegExp(String.raw`(-\s*\*\*${label}\*\*:\s*)\[TO FILL:[^\]]+\]`);
  if (placeholderPattern.test(content)) {
    return { content: content.replace(placeholderPattern, `$1${value}`), applied: value };
  }
  return { content };
}

function replaceTableRow(content: string, category: string, value?: string): { content: string; applied?: string } {
  if (!value) return { content };
  const rowPattern = new RegExp(String.raw`(\|\s*${category}\s*\|\s*)([^|]*)(\|)`, "i");
  if (rowPattern.test(content)) {
    return { content: content.replace(rowPattern, `$1${value} $3`), applied: value };
  }
  return { content };
}

function replaceBulletPlaceholder(content: string, value?: string): { content: string; applied?: string } {
  if (!value) return { content };
  const placeholderPattern = /- \[TO FILL:[^\]]+\]/;
  if (placeholderPattern.test(content)) {
    return { content: content.replace(placeholderPattern, `- ${value}`), applied: value };
  }
  return { content };
}

function replaceApprover(content: string, value?: string): { content: string; applied?: string } {
  if (!value) return { content };
  const pattern = /Changes require approval from \[TO FILL:[^\]]+\]/;
  if (pattern.test(content)) {
    return { content: content.replace(pattern, `Changes require approval from ${value}`), applied: value };
  }
  return { content };
}

export async function updateConstitution(
  projectPath: string,
  detection: StackDetection,
  answers: ConstitutionAnswers = {}
): Promise<ConstitutionUpdateResult> {
  const filePath = path.join(projectPath, ".spec-kit", "memory", "constitution.md");

  if (!(await exists(filePath))) {
    return {
      updated: false,
      filePath,
      remainingPlaceholders: ["constitution.md not found"],
      applied: {},
    };
  }

  const original = await fs.readFile(filePath, "utf-8");
  let content = original;
  const applied: Record<string, string> = {};
  const today = new Date().toISOString().slice(0, 10);

  const projectName = answers.projectName ?? detection.projectName ?? path.basename(projectPath);
  const ratificationDate = answers.ratificationDate ?? today;
  const lastAmended = answers.lastAmended ?? ratificationDate;

  // Always replace projectName even if detection failed
  let result = replaceLabelPlaceholder(content, "Project Name", projectName || "Unnamed Project");
  content = result.content;
  if (result.applied) applied.projectName = result.applied;

  result = replaceLabelPlaceholder(content, "Ratification Date", ratificationDate);
  content = result.content;
  if (result.applied) applied.ratificationDate = result.applied;

  result = replaceLabelPlaceholder(content, "Last Amended", lastAmended);
  content = result.content;
  if (result.applied) applied.lastAmended = result.applied;

  // Keep version if already set; only fill placeholder
  result = replaceLabelPlaceholder(content, "Version", "1.0.0");
  content = result.content;
  if (result.applied) applied.version = result.applied;

  // Tech stack table - always provide fallback values
  const language = answers.language ?? detection.language ?? "To be defined";
  const framework = answers.framework ?? detection.framework ?? "To be defined";
  const database = answers.database ?? detection.database ?? "To be defined";
  const testing = answers.testing ?? detection.testing ?? "To be defined";

  result = replaceTableRow(content, "Language", language);
  content = result.content;
  if (result.applied) applied.language = result.applied;

  result = replaceTableRow(content, "Framework", framework);
  content = result.content;
  if (result.applied) applied.framework = result.applied;

  result = replaceTableRow(content, "Database", database);
  content = result.content;
  if (result.applied) applied.database = result.applied;

  result = replaceTableRow(content, "Testing", testing);
  content = result.content;
  if (result.applied) applied.testing = result.applied;

  const codeStyle = answers.codeStyle ?? detection.codeStyle ?? "To be defined";
  result = replaceBulletPlaceholder(content, codeStyle);
  content = result.content;
  if (result.applied) applied.codeStyle = result.applied;

  result = replaceApprover(content, answers.approvers);
  content = result.content;
  if (result.applied) applied.approvers = result.applied;

  // Version history date
  const historyPattern = /\|\s*1\.0\.0\s*\|\s*\[TO FILL\]\s*\|/;
  if (historyPattern.test(content)) {
    content = content.replace(historyPattern, `| 1.0.0 | ${ratificationDate} |`);
    applied.versionHistoryDate = ratificationDate;
  }

  if (content !== original) {
    await fs.writeFile(filePath, content, "utf-8");
  }

  const remainingPlaceholders = content.match(/\[TO FILL:[^\]]+\]/g) ?? [];

  return {
    updated: content !== original,
    filePath,
    remainingPlaceholders,
    applied,
  };
}
