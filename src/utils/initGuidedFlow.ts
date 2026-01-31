/**
 * Guided Init Flow Utilities
 * 
 * Provides question definitions and answer normalization for guided init.
 */

import * as path from "node:path";
import type { StackDetection } from "./stackDetector.js";
import type { ConstitutionAnswers } from "./constitutionUpdater.js";

export interface InitQuestion {
  key: keyof ConstitutionAnswers;
  label: string;
  suggestion?: string;
}

export interface NormalizedAnswer {
  value?: string;
  skipped: boolean;
}

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildInitQuestions(
  projectPath: string,
  detection: StackDetection,
  today: string = getTodayDate()
): InitQuestion[] {
  return [
    {
      key: "projectName",
      label: "Nom du projet",
      suggestion: detection.projectName ?? path.basename(projectPath),
    },
    {
      key: "ratificationDate",
      label: "Date de ratification (YYYY-MM-DD)",
      suggestion: today,
    },
    {
      key: "lastAmended",
      label: "Dernière mise à jour (YYYY-MM-DD)",
      suggestion: today,
    },
    {
      key: "language",
      label: "Langage principal",
      suggestion: detection.language,
    },
    {
      key: "framework",
      label: "Framework principal",
      suggestion: detection.framework,
    },
    {
      key: "database",
      label: "Base de données",
      suggestion: detection.database,
    },
    {
      key: "testing",
      label: "Outils de test",
      suggestion: detection.testing,
    },
    {
      key: "codeStyle",
      label: "Conventions de style de code",
      suggestion: detection.codeStyle,
    },
    {
      key: "approvers",
      label: "Qui approuve les changements de constitution",
    },
  ];
}

export function normalizeGuidedAnswer(
  answer: string | undefined,
  suggestion: string | undefined,
  today: string = getTodayDate()
): NormalizedAnswer {
  if (!answer) {
    return { skipped: false };
  }

  const trimmed = answer.trim();
  if (!trimmed) {
    return { skipped: false };
  }

  const lower = trimmed.toLowerCase();

  if (lower === "skip" || lower === "pass") {
    return { skipped: true };
  }

  if (lower === "auto" || lower === "default") {
    return { skipped: false, value: suggestion };
  }

  if (lower === "today" || lower === "aujourdhui" || lower === "aujourd'hui") {
    return { skipped: false, value: today };
  }

  return { skipped: false, value: trimmed };
}

export function isAnswerFilled(
  answers: ConstitutionAnswers,
  question: InitQuestion,
  skippedKeys: Set<keyof ConstitutionAnswers>
): boolean {
  return Boolean(answers[question.key]) || skippedKeys.has(question.key);
}
