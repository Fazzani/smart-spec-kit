---
description: "Execute the implementation plan by processing tasks from tasks.md"
mode: "agent"
tools: ["mcp_spec-kit_speckit_implement"]
---

# /speckit.implement

Execute the implementation plan by processing and executing all tasks defined in tasks.md.

## User Input

```
$ARGUMENTS
```

You MUST consider the user input before proceeding (if not empty).

## Execution Steps

### 1. Check Checklists Status (if exists)

If `specs/checklists/` directory exists, scan all checklist files:

```markdown
| Checklist | Total | Completed | Incomplete | Status |
|-----------|-------|-----------|------------|--------|
| ux.md     | 12    | 12        | 0          | ✓ PASS |
| test.md   | 8     | 5         | 3          | ✗ FAIL |
| security.md | 6   | 6         | 0          | ✓ PASS |
```

**Calculate overall status**:
- **PASS**: All checklists have 0 incomplete items
- **FAIL**: One or more checklists have incomplete items

**If any checklist is incomplete**:
- Display the table with incomplete item counts
- STOP and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
- Wait for user response before continuing
- If user says "no"/"wait"/"stop" → halt execution
- If user says "yes"/"proceed"/"continue" → proceed to step 2

**If all checklists pass**: Automatically proceed to step 2

### 2. Load Implementation Context

- **REQUIRED**: Read `tasks.md` for complete task list and execution plan
- **REQUIRED**: Read `plan.md` for tech stack, architecture, and file structure
- **IF EXISTS**: Read `data-model.md` for entities and relationships
- **IF EXISTS**: Read `contracts/` for API specifications
- **IF EXISTS**: Read `research.md` for technical decisions
- **IF EXISTS**: Read `quickstart.md` for integration scenarios

### 3. Project Setup Verification

Create/verify ignore files based on detected project setup:

#### Detection Logic:
| Check | Create/Verify |
|-------|---------------|
| Git repo (`git rev-parse --git-dir`) | `.gitignore` |
| `Dockerfile*` exists or Docker in plan.md | `.dockerignore` |
| `.eslintrc*` exists | `.eslintignore` |
| `eslint.config.*` exists | Ensure `ignores` entries |
| `.prettierrc*` exists | `.prettierignore` |
| `package.json` exists (if publishing) | `.npmignore` |
| `*.tf` files exist | `.terraformignore` |
| Helm charts present | `.helmignore` |

#### Common Patterns by Technology:

| Technology | Patterns |
|------------|----------|
| **Node.js/TypeScript** | `node_modules/`, `dist/`, `build/`, `*.log`, `.env*` |
| **Python** | `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/` |
| **Java** | `target/`, `*.class`, `*.jar`, `.gradle/`, `build/` |
| **C#/.NET** | `bin/`, `obj/`, `*.user`, `*.suo`, `packages/` |
| **Go** | `*.exe`, `*.test`, `vendor/`, `*.out` |
| **Rust** | `target/`, `debug/`, `release/`, `*.rs.bk` |
| **Universal** | `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/` |

**If ignore file exists**: Verify essential patterns, append missing critical patterns only
**If ignore file missing**: Create with full pattern set for detected technology

### 4. Parse Tasks Structure

Extract from `tasks.md`:
- Task phases: Setup, Foundational, User Stories, Polish
- Task dependencies: Sequential vs parallel `[P]` markers
- Task details: ID, description, file paths
- Execution flow: Order and dependency requirements

### 5. Execute Implementation

Follow the task plan phase-by-phase:

#### Execution Rules:
1. **Phase-by-phase**: Complete each phase before moving to next
2. **Respect dependencies**: Run sequential tasks in order; parallel `[P]` tasks can run together
3. **Follow TDD approach**: If tests requested, execute test tasks before corresponding implementation
4. **File-based coordination**: Tasks affecting same files must run sequentially
5. **Validation checkpoints**: Verify each phase completion before proceeding

#### Execution Order:
1. **Setup first**: Initialize project structure, dependencies, configuration
2. **Tests before code** (if TDD): Write tests for contracts, entities, integration scenarios
3. **Core development**: Implement models, services, CLI commands, endpoints
4. **Integration work**: Database connections, middleware, logging, external services
5. **Polish and validation**: Unit tests, performance optimization, documentation

### 6. Progress Tracking

After each completed task:
- Report progress
- **IMPORTANT**: Mark task as complete in tasks.md: `- [x] T### ...`
- For parallel tasks `[P]`: Continue with successful tasks, report failed ones
- Provide clear error messages with context for debugging
- Suggest next steps if implementation cannot proceed

#### Error Handling:
- **Sequential task fails**: Halt execution
- **Parallel task fails**: Continue others, report failure
- **Missing dependency**: Suggest running prerequisite command

### 7. Completion Validation

At end of implementation:
- Verify all required tasks completed
- Check implemented features match original specification
- Validate tests pass (if applicable)
- Confirm implementation follows technical plan

### 8. Report Final Status

Output:
- Summary of completed work
- Tasks completed vs total
- Any remaining tasks or blockers
- Suggested next steps:
  - Run tests: `npm test` / `pytest` / etc.
  - Review changes: `git diff`
  - Create PR: `git push`
- If tasks incomplete, suggest running `/speckit.tasks` to regenerate

---

## Task Execution Format

When implementing a task, follow this pattern:

```markdown
### Executing T### - [Description]

**File**: `path/to/file.ext`
**Status**: In Progress

[Implementation code or changes]

**Result**: ✓ Complete / ✗ Failed
**Notes**: [Any relevant information]
```

After completion, update tasks.md:
```markdown
- [x] T### [P] [US#] Description with file path
```

---

## Context

- Load `.spec-kit/memory/constitution.md` for project conventions
- If tasks.md missing or incomplete, suggest running `/speckit.tasks` first
- Respect project-specific guidelines from constitution
- Commit regularly with meaningful messages
