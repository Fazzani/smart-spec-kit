/**
 * Stack Detector
 * 
 * Detects project language, framework, database, and testing stack
 * based on common project files and dependencies.
 */

import * as fs from "node:fs/promises";
import type { Dirent } from "node:fs";
import * as path from "node:path";

export interface StackDetection {
  projectName?: string;
  language?: string;
  framework?: string;
  database?: string;
  testing?: string;
  codeStyle?: string;
  evidence: string[];
}

const EXCLUDED_DIRS = new Set(["node_modules", ".git", "dist", "build", "out", ".next", ".turbo", ".cache"]);

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile<T = unknown>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function readTextFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

async function listFilesRecursive(root: string, depth: number, results: string[] = []): Promise<string[]> {
  if (depth < 0) return results;

  let entries: Dirent[] = [];
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      await listFilesRecursive(path.join(root, entry.name), depth - 1, results);
    } else {
      results.push(path.join(root, entry.name));
    }
  }

  return results;
}

function addUnique(list: string[], value?: string): void {
  if (!value) return;
  if (!list.includes(value)) list.push(value);
}

function joinValues(values: string[]): string | undefined {
  if (values.length === 0) return undefined;
  return values.join(" + ");
}

function detectFromDependencies(deps: Set<string>): {
  frameworks: string[];
  testing: string[];
  database?: string;
} {
  const frameworks: string[] = [];
  const testing: string[] = [];

  const frameworkMap: Array<[string, string]> = [
    ["next", "Next.js"],
    ["react", "React"],
    ["vue", "Vue"],
    ["nuxt", "Nuxt"],
    ["svelte", "Svelte"],
    ["@angular/core", "Angular"],
    ["express", "Express"],
    ["@nestjs/core", "NestJS"],
    ["fastify", "Fastify"],
    ["koa", "Koa"],
  ];

  const testMap: Array<[string, string]> = [
    ["vitest", "Vitest"],
    ["jest", "Jest"],
    ["mocha", "Mocha"],
    ["ava", "AVA"],
    ["@playwright/test", "Playwright"],
    ["cypress", "Cypress"],
  ];

  for (const [dep, label] of frameworkMap) {
    if (deps.has(dep)) addUnique(frameworks, label);
  }

  for (const [dep, label] of testMap) {
    if (deps.has(dep)) addUnique(testing, label);
  }

  const databaseMap: Array<[string[], string]> = [
    [["mongoose"], "MongoDB"],
    [["pg", "pg-promise"], "PostgreSQL"],
    [["mysql2", "mysql"], "MySQL"],
    [["sqlite3", "better-sqlite3"], "SQLite"],
    [["prisma"], "Prisma (DB non détectée)"],
    [["typeorm"], "TypeORM (DB non détectée)"],
    [["sequelize"], "Sequelize (DB non détectée)"],
  ];

  let database: string | undefined;
  for (const [depsList, label] of databaseMap) {
    if (depsList.some(dep => deps.has(dep))) {
      database = label;
      break;
    }
  }

  return { frameworks, testing, database };
}

function detectCodeStyleFiles(fileList: string[], projectPath: string): string | undefined {
  const normalized = fileList.map(file => path.relative(projectPath, file).toLowerCase());
  const hasEslint = normalized.some(file =>
    file.startsWith(".eslintrc") || file === "eslint.config.js" || file === "eslint.config.mjs"
  );
  const hasPrettier = normalized.some(file =>
    file.startsWith(".prettierrc") || file === "prettier.config.js" || file === "prettier.config.cjs"
  );

  const parts: string[] = [];
  if (hasEslint) parts.push("ESLint");
  if (hasPrettier) parts.push("Prettier");

  return joinValues(parts);
}

function extractPythonDeps(text: string): Set<string> {
  const deps = new Set<string>();
  const lines = text.split("\n").map(line => line.trim());
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const name = line.split(/[<=>\s]/)[0];
    if (name) deps.add(name.toLowerCase());
  }
  return deps;
}

interface MutableDetection {
  projectName?: string;
  languages: string[];
  frameworks: string[];
  testing: string[];
  database?: string;
  evidence: string[];
}

async function detectNodeStack(projectPath: string, detection: MutableDetection): Promise<void> {
  const packageJsonPath = path.join(projectPath, "package.json");
  const tsconfigPath = path.join(projectPath, "tsconfig.json");

  if (!(await exists(packageJsonPath))) return;

  const pkg = await readJsonFile<{ name?: string; dependencies?: Record<string, string>; devDependencies?: Record<string, string> }>(packageJsonPath);
  if (!pkg) return;

  detection.evidence.push("package.json");
  if (pkg.name) detection.projectName = pkg.name;

  const depNames = new Set<string>([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);

  if (depNames.has("typescript") || (await exists(tsconfigPath))) {
    addUnique(detection.languages, "TypeScript");
  } else {
    addUnique(detection.languages, "JavaScript");
  }

  const depDetection = detectFromDependencies(depNames);
  for (const fw of depDetection.frameworks) addUnique(detection.frameworks, fw);
  for (const test of depDetection.testing) addUnique(detection.testing, test);
  if (depDetection.database) detection.database = depDetection.database;
}

async function detectPythonStack(projectPath: string, detection: MutableDetection): Promise<void> {
  const pyprojectPath = path.join(projectPath, "pyproject.toml");
  const requirementsPath = path.join(projectPath, "requirements.txt");
  const poetryLockPath = path.join(projectPath, "poetry.lock");

  if (!(await exists(pyprojectPath)) && !(await exists(requirementsPath)) && !(await exists(poetryLockPath))) return;

  addUnique(detection.languages, "Python");
  detection.evidence.push("python files");

  const pyText = (await readTextFile(pyprojectPath)) ?? (await readTextFile(requirementsPath)) ?? "";
  const pyDeps = extractPythonDeps(pyText);

  if (pyDeps.has("django")) addUnique(detection.frameworks, "Django");
  if (pyDeps.has("flask")) addUnique(detection.frameworks, "Flask");
  if (pyDeps.has("fastapi")) addUnique(detection.frameworks, "FastAPI");
  if (pyDeps.has("pytest")) addUnique(detection.testing, "Pytest");
  if (pyDeps.has("sqlalchemy") && !detection.database) detection.database = "SQLAlchemy";
}

async function detectOtherStacks(projectPath: string, detection: MutableDetection): Promise<void> {
  const goModPath = path.join(projectPath, "go.mod");
  const cargoPath = path.join(projectPath, "Cargo.toml");
  const pomPath = path.join(projectPath, "pom.xml");
  const gradlePath = path.join(projectPath, "build.gradle");
  const gradleKtsPath = path.join(projectPath, "build.gradle.kts");
  const composerPath = path.join(projectPath, "composer.json");
  const gemfilePath = path.join(projectPath, "Gemfile");
  const pubspecPath = path.join(projectPath, "pubspec.yaml");

  if (await exists(goModPath)) {
    addUnique(detection.languages, "Go");
    detection.evidence.push("go.mod");
  }

  if (await exists(cargoPath)) {
    addUnique(detection.languages, "Rust");
    detection.evidence.push("Cargo.toml");
  }

  if (await exists(pomPath) || await exists(gradlePath) || await exists(gradleKtsPath)) {
    addUnique(detection.languages, "Java");
    detection.evidence.push("Java build files");
  }

  if (await exists(composerPath)) {
    addUnique(detection.languages, "PHP");
    detection.evidence.push("composer.json");
  }

  if (await exists(gemfilePath)) {
    addUnique(detection.languages, "Ruby");
    detection.evidence.push("Gemfile");
  }

  if (await exists(pubspecPath)) {
    addUnique(detection.languages, "Dart");
    detection.evidence.push("pubspec.yaml");
  }
}

async function detectDotNet(projectPath: string, detection: MutableDetection): Promise<void> {
  const files = await listFilesRecursive(projectPath, 2);
  const csprojFound = files.some(file => file.toLowerCase().endsWith(".csproj"));
  if (csprojFound) {
    addUnique(detection.languages, ".NET");
    detection.evidence.push(".csproj");
  }
}

export async function detectStack(projectPath: string): Promise<StackDetection> {
  const detection: MutableDetection = {
    languages: [],
    frameworks: [],
    testing: [],
    evidence: [],
  };

  await detectNodeStack(projectPath, detection);
  await detectPythonStack(projectPath, detection);
  await detectOtherStacks(projectPath, detection);
  await detectDotNet(projectPath, detection);

  const files = await listFilesRecursive(projectPath, 2);
  const codeStyle = detectCodeStyleFiles(files, projectPath);

  return {
    projectName: detection.projectName,
    language: joinValues(detection.languages),
    framework: joinValues(detection.frameworks),
    database: detection.database,
    testing: joinValues(detection.testing),
    codeStyle,
    evidence: detection.evidence,
  };
}
