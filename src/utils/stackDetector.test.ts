/**
 * Tests for stack detection and constitution update.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { detectStack } from "./stackDetector.js";
import { updateConstitution } from "./constitutionUpdater.js";

async function createTempProject(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "spec-kit-test-"));
  return dir;
}

test("detectStack infers TypeScript + React + Jest + PostgreSQL", async () => {
  const projectPath = await createTempProject();

  await fs.writeFile(
    path.join(projectPath, "package.json"),
    JSON.stringify({
      name: "demo-app",
      dependencies: {
        react: "18.0.0",
        pg: "8.0.0",
      },
      devDependencies: {
        typescript: "5.0.0",
        jest: "29.0.0",
      },
    }, null, 2),
    "utf-8"
  );

  await fs.writeFile(path.join(projectPath, "tsconfig.json"), "{}", "utf-8");

  const detection = await detectStack(projectPath);

  assert.equal(detection.projectName, "demo-app");
  assert.equal(detection.language, "TypeScript");
  assert.equal(detection.framework, "React");
  assert.equal(detection.testing, "Jest");
  assert.equal(detection.database, "PostgreSQL");
});

test("updateConstitution fills tech stack placeholders", async () => {
  const projectPath = await createTempProject();
  const memoryDir = path.join(projectPath, ".spec-kit", "memory");
  await fs.mkdir(memoryDir, { recursive: true });

  const constitutionTemplate = `# Project Constitution

## Project Information

- **Project Name**: [TO FILL: Your project name]
- **Ratification Date**: [TO FILL: YYYY-MM-DD]
- **Last Amended**: [TO FILL: YYYY-MM-DD]
- **Version**: 1.0.0

---

## Tech Stack Guidelines

### Preferred Technologies
| Category | Technology | Notes |
|----------|------------|-------|
| Language | [TO FILL] | |
| Framework | [TO FILL] | |
| Database | [TO FILL] | |
| Testing | [TO FILL] | |

### Code Style
- [TO FILL: Link to style guide or describe key conventions]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | [TO FILL] | Initial constitution |
`;

  const constitutionPath = path.join(memoryDir, "constitution.md");
  await fs.writeFile(constitutionPath, constitutionTemplate, "utf-8");

  const update = await updateConstitution(
    projectPath,
    {
      language: "TypeScript",
      framework: "React",
      database: "PostgreSQL",
      testing: "Vitest",
      evidence: [],
    },
    {
      projectName: "SpecKit Demo",
      codeStyle: "ESLint + Prettier",
    }
  );

  assert.equal(update.updated, true);
  const updated = await fs.readFile(constitutionPath, "utf-8");

  assert.match(updated, /\*\*Project Name\*\*: SpecKit Demo/);
  assert.match(updated, /\| Language \|\s*TypeScript\s*\|/);
  assert.match(updated, /\| Framework \|\s*React\s*\|/);
  assert.match(updated, /\| Database \|\s*PostgreSQL\s*\|/);
  assert.match(updated, /\| Testing \|\s*Vitest\s*\|/);
  assert.match(updated, /- ESLint \+ Prettier/);
});
