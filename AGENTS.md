# AGENTS.md

## Project Overview

**Spec-Kit MCP Server** - AI-driven specification platform using MCP (Model Context Protocol) for VS Code & GitHub Copilot.

**Tech Stack:** Node.js 18+ | TypeScript | MCP SDK | YAML | Markdown

**Key Concept:** Agents in this project are **system prompts** (AI personas), NOT GitHub Copilot agents.

---

## Required Expertise

You must be expert in:

- ✅ TypeScript (strict mode, async/await, Zod validation)
- ✅ npm (package publishing, dependencies, scripts)
- ✅ MCP (Model Context Protocol, tools, servers)
- ✅ Spec-Kit (agents, workflows, prompts, templates)

---

## Setup Commands

```bash
# Install dependencies
npm install

# Build the project (TypeScript compilation + asset verification + permissions)
npm run build

# Development mode with watch
npm run dev

# Run tests
npm test

# Install into a user project
npx smart-spec-kit-mcp setup
```

---

## Dev Environment Tips

- Use `npm run build` before testing changes - it compiles TypeScript, copies assets from `starter-kit/`, and fixes CLI permissions.
- Run `npm run dev` for watch mode during development.
- Test MCP tools via Copilot Chat with slash commands: `/speckit.specify`, `/speckit.plan`, etc.
- Check `dist/` for compiled output - this is what gets published to npm.
- Assets in `starter-kit/` are the source of truth - never modify files there directly in user projects.

---

## Testing Instructions

- Run `npm run build && npm test` before committing.
- Test the setup command: `npx smart-spec-kit-mcp setup` in a test project.
- Verify MCP server starts: `npm start`
- Test each slash command in Copilot Chat after changes.
- Check asset loading works: local `.spec-kit/` should override `starter-kit/`.
- Validate workflows parse correctly: all YAML must pass `WorkflowSchema` validation.
- Fix any TypeScript, ESLint, or Prettier errors - linting must pass without warnings.
- Add or update tests for the code you change, even if nobody asked.

---

## Code Style

- **TypeScript strict mode** - no `any`, explicit types for function params and returns
- **ESM modules** - `"type": "module"` in package.json
- **Async/await** - all file I/O operations must be async
- **Zod validation** - validate all user inputs before processing
- **JSDoc comments** - document all public functions
- **Error messages** - always include context and suggestions

Example:

```typescript
// ❌ Bad
throw new Error("File not found");

// ✅ Good
throw new Error(
  `Workflow "${name}" not found.\n` +
  `Available: ${available.join(", ")}\n\n` +
  `Tip: Create custom workflows in .spec-kit/workflows/`
);
```

---

## Critical Rules

### 1. Documentation Updates (MANDATORY)

After each **feature** or **breaking change**:

- ✅ Update `README.md` if user-facing
- ✅ Update `docs/DOCUMENTATION.md` if API changes
- ✅ Update slash commands in `starter-kit/github-prompts/` if needed
- ❌ **No documentation needed** for bug fixes or minor tweaks

### 2. Never Modify Built-in Assets

- ❌ **DO NOT** edit files in `starter-kit/` directly
- ✅ **DO** copy to `.spec-kit/` in test projects for customization

### 3. Local-First Resolution

All assets follow this priority:

1. `.spec-kit/` in user project (local override - highest priority)
2. `starter-kit/` in package (built-in fallback)

Applies to: prompts, templates, workflows, agents, rules.

### 4. Validation First

- Always validate with Zod schemas before processing
- Provide helpful error messages with context and suggestions

### 5. Async Everywhere

All file I/O and loading operations MUST be async:

```typescript
const workflow = await loadWorkflow("name");
const agent = await loadAgent("SpecAgent");
```

---

## Project Structure

```text
src/
├── tools/           # MCP tools (promptTools, agentTools, workflowTools)
├── utils/           # Loaders (workflow, agent, template)
├── engine/          # Workflow execution
├── schemas/         # Zod validation
└── index.ts         # MCP server entry

starter-kit/         # Assets (installed to user .spec-kit/)
├── prompts/         # Prompt instructions (7 files)
├── templates/       # Document templates (4 files)
├── workflows/       # YAML workflows (5 files)
├── agents/          # Agent definitions (5 files)
├── rules/           # Validation rules (2 files)
├── memory/          # Constitution (1 file)
└── github-prompts/  # Slash commands (9 files)
```

---

## Common Tasks

### Add a new MCP tool

1. Create tool in `src/tools/promptTools.ts`
2. Define Zod schema for arguments
3. Create slash command in `starter-kit/github-prompts/speckit.NAME.prompt.md`
4. Update `README.md` command tables
5. Update `docs/DOCUMENTATION.md` with API reference
6. Test with Copilot Chat

### Add a new built-in agent

1. Create `starter-kit/agents/AgentName.md` (YAML frontmatter + system prompt)
2. Update `docs/AGENTS.md` built-in agents table
3. Add to `scripts/copy-assets.js` verification
4. Test loading with `loadAgent("AgentName")`

### Add a new workflow

1. Create `starter-kit/workflows/workflow-name.yaml`
2. Validate against `src/schemas/workflowSchema.ts`
3. Test with `start_workflow workflow_name="workflow-name"`
4. Document in `README.md` and `docs/DOCUMENTATION.md`

---

## Agent Format

Agents are Markdown files with YAML frontmatter + system prompt:

```markdown
---
name: AgentName
displayName: "Display Name"
description: "Expert in X"
capabilities:
  - Capability 1
---

## System Prompt
You are AgentName, expert in...
```

**Built-in agents:** SpecAgent, PlanAgent, GovAgent, TestAgent

**Custom agents:** Create in `.spec-kit/agents/MyAgent.md`

---

## Workflow Format

YAML files with steps:

```yaml
name: workflow-name
version: "1.0.0"
description: "What it does"
steps:
  - id: step1
    agent: SpecAgent
    action: call_agent
    inputs: {...}
    outputs: [...]
```

**Built-in workflows:**

- `feature-quick` - 2 steps (spec → implement)
- `feature-standard` - 4 steps (spec → plan → tasks → implement)
- `feature-full` - 5 steps (+ validation)
- `bugfix` - 4 steps (reproduce → fix)

All workflows validated with `src/schemas/workflowSchema.ts` (Zod).

---

## PR Instructions

- Title format: `[feature|fix|docs]: Brief description`
- Always run `npm run build` and `npm test` before committing
- Update documentation for features (README.md, DOCUMENTATION.md)
- Fix all TypeScript, ESLint, and Prettier errors
- Test MCP tools via Copilot Chat
- Verify asset loading (local override works)

---

## Troubleshooting

**Build fails:**

```bash
rm -rf dist node_modules
npm install
npm run build
```

**Agent not found:**

```bash
ls .spec-kit/agents/     # Check local
ls starter-kit/agents/   # Check built-in
```

**Workflow parsing error:**

- Validate YAML syntax: https://www.yamllint.com/
- Check required fields in `src/schemas/workflowSchema.ts`

**MCP server won't start:**

- Check `.vscode/settings.json` has correct MCP config
- Run `npx smart-spec-kit-mcp setup` to reinstall
- Reload VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

---

## Security Considerations

- Only read from trusted locations (`.spec-kit/`, `starter-kit/`)
- Never execute arbitrary code from user files
- Validate all file paths before reading (prevent directory traversal)
- Use `yaml.load()` (safe loader) for YAML parsing
- Never log secrets (API keys, tokens)

---
