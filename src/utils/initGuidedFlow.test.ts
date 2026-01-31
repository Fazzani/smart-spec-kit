/**
 * Tests for guided init flow utilities.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInitQuestions, normalizeGuidedAnswer } from "./initGuidedFlow.js";

const detection = {
  projectName: "demo-app",
  language: "TypeScript",
  framework: "React",
  database: "PostgreSQL",
  testing: "Vitest",
  codeStyle: "ESLint + Prettier",
  evidence: [],
};

test("buildInitQuestions uses detection values", () => {
  const questions = buildInitQuestions("/tmp/demo", detection, "2026-01-31");
  const projectNameQuestion = questions[0];
  assert.ok(projectNameQuestion);
  assert.equal(projectNameQuestion.suggestion, "demo-app");
  const languageQuestion = questions.find(q => q.key === "language");
  assert.equal(languageQuestion?.suggestion, "TypeScript");
});

test("normalizeGuidedAnswer respects auto/skip/today", () => {
  const auto = normalizeGuidedAnswer("auto", "React", "2026-01-31");
  assert.equal(auto.value, "React");
  assert.equal(auto.skipped, false);

  const skip = normalizeGuidedAnswer("skip", "React", "2026-01-31");
  assert.equal(skip.value, undefined);
  assert.equal(skip.skipped, true);

  const today = normalizeGuidedAnswer("today", "", "2026-01-31");
  assert.equal(today.value, "2026-01-31");
});
