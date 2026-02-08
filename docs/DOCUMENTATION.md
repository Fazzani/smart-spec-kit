# Spec-Kit Documentation

This is the comprehensive documentation for Spec-Kit. Copilot can read this file to answer user questions.

## Overview

Spec-Kit is an MCP (Model Context Protocol) server that provides **customizable prompts** and workflow orchestration for specification-driven development. It integrates with GitHub Copilot in VS Code to guide developers through creating specifications, plans, tasks, and implementation.

## Architecture

### Components

1. **MCP Server** (`smart-spec-kit-mcp`)
   - Runs as a background process
   - Exposes tools via Model Context Protocol
   - Communicates with GitHub Copilot

2. **Slash Commands** (`.github/prompts/`)
   - Native GitHub Copilot slash commands (`/speckit.*`)
   - Trigger MCP tools directly
   - Discovered automatically by VS Code

3. **Copilot Instructions** (`.github/copilot-instructions.md`)
   - Tells Copilot how to use Spec-Kit tools
   - Defines keyword commands and aliases

4. **Prompts** (`.spec-kit/prompts/`)
   - Customizable prompt files read by MCP tools
   - Define behavior for each command
   - Versioned and maintainable in your project

5. **Templates** (`.spec-kit/templates/`)
   - Document templates for specs, plans, tasks, and supporting documents
   - Markdown and YAML formats
   - **Available templates**:
     - `functional-spec.md` - Feature specification
     - `plan-template.md` - Implementation plan with Phase -1 Gates
     - `tasks-template.md` - Task breakdown
     - `data-model.md` - Entity definitions, relations, validation
     - `quickstart.md` - Manual validation scenarios
     - `research.md` - Technical research and comparisons
     - `contracts/api-template.yaml` - OpenAPI 3.0 specification
     - `contracts/events-template.md` - WebSocket/SSE event contracts

6. **Constitution** (`.spec-kit/memory/constitution.md`)
   - Project principles and conventions
   - Technical stack definition
   - Development guidelines

7. **Rules** (`.spec-kit/rules/`)
   - Validation rules (security, RGPD, custom)
   - Markdown checklists

8. **Workflows** (`.spec-kit/workflows/`)
   - YAML-based workflow definitions
   - Multi-step automated processes

9. **Native VS Code Agents** (`.github/agents/`) - VS Code 1.109+
   - `.agent.md` files with frontmatter configuration
   - Model fallback chains, tool declarations, subagent orchestration
   - Discovered automatically via `chat.agentFilesLocations` setting

10. **Agent Skills** (`.github/skills/`) - VS Code 1.109+
    - `SKILL.md` files providing reusable knowledge modules
    - Shared between agents via `chat.agentSkillsLocations` setting
    - Available: spec-driven-dev, security-validation, api-design

11. **MCP Apps** - Interactive Visualizations
    - Rich HTML dashboards embedded in chat responses
    - Workflow progress dashboard (`speckit_dashboard`)
    - Traceability matrix visualization (`speckit_traceability`)

12. **Copilot Memory** - Dual Memory Architecture
    - Native Copilot Memory: cross-session personal preferences
    - Spec-Kit Memory (`.spec-kit/memory/`): project-level team-shared knowledge

---

## MCP Tools

> **Note**: All parameters are optional. Spec-Kit is designed to be conversational - if you don't provide information upfront, Copilot will ask for it.

### init

**Purpose**: Initialize Spec-Kit in the current project. If `guided` is not specified, Spec-Kit asks you to choose guided vs auto. Guided mode is interactive (Q/A). Auto mode fills the constitution from project detection.

**Keyword Triggers**: `speckit: init`, `init`

**Parameters** (all optional):

- `force`: Overwrite existing Spec-Kit files
- `guided`: Enable guided setup (detect stack and fill constitution)
- `session_id`: Session ID for guided mode
- `answer`: Answer for the current guided question
- `cancel`: Cancel guided session
- `answers`: Overrides for constitution fields
  - `projectName`, `ratificationDate`, `lastAmended`
  - `language`, `framework`, `database`, `testing`, `codeStyle`
  - `approvers`

**Examples**:

```text
speckit: init
speckit: init guided=true
speckit: init guided=true answer="My Project"
speckit: init guided=true session_id=init-abc answer="auto"
speckit: init guided=true answers={"projectName":"Demo","language":"TypeScript","framework":"React"}
```

**Behavior**:

1. Installs prompts, templates, memory, rules, agents, and specs folders
2. If `guided` is enabled, detects the stack from project files
3. Updates `.spec-kit/memory/constitution.md` with detected or provided values
4. Lists any remaining placeholders to fill

### speckit_specify

**Purpose**: Create a functional specification from requirements.

**Slash Command**: `/speckit.specify`

**Keyword Triggers**: `speckit: spec`, `speckit: specify`, `créer une spec`

**Parameters** (all optional):

- `requirements`: What you want to build. Can be:
  - A feature description: "user authentication with email/password"
  - A user story: "As a user, I want to..."
  - An Azure DevOps work item ID: "#12345"
- `contextId`: ID for the specification filename

**Examples**:

```text
speckit: spec
speckit: spec pour un système de notifications push
speckit: spec user authentication with OAuth
```

**Behavior**:

1. Loads prompt from `.spec-kit/prompts/specify.md`
2. Loads constitution from `.spec-kit/memory/constitution.md`
3. Loads template from `.spec-kit/templates/functional-spec.md`
4. If no requirements provided, asks the user
5. Output saved to `specs/{contextId}-spec.md`

### speckit_plan

**Purpose**: Create a complete implementation plan with supporting documents from a specification.

**Slash Command**: `/speckit.plan`

**Keyword Triggers**: `speckit: plan`, `planifier`, `créer un plan`

**Parameters** (all optional):

- `specPath`: Path to specification file (auto-detects most recent if not provided)

**Examples**:

```text
speckit: plan
speckit: plan pour la spec specs/auth-spec.md
```

**Behavior**:

1. Finds the most recent specification in `specs/`
2. Loads prompt from `.spec-kit/prompts/plan.md`
3. **Validates Phase -1 Gates** (mandatory before planning):
   - Simplicity Gate (Article VII): ≤3 projects, no future-proofing
   - Anti-Abstraction Gate (Article VIII): Use framework directly
   - Integration-First Gate (Article IX): Contracts before code
   - Test-First Gate (Article III): Tests derived from spec
4. Generates the main plan (`plan.md`)
5. **Generates supporting documents**:
   - `data-model.md` - Entity definitions, relations, validation rules
   - `contracts/api.yaml` - OpenAPI 3.0 specification
   - `contracts/events.md` - Real-time events (if applicable)
   - `quickstart.md` - Manual validation scenarios
   - `research.md` - Technical research (optional)

**Output Structure**:

```
specs/[branch-name]/
├── spec.md           # Already exists
├── plan.md           # Main implementation plan
├── data-model.md     # Entity definitions
├── quickstart.md     # Validation scenarios
├── research.md       # Technical research (optional)
└── contracts/
    ├── api.yaml      # OpenAPI 3.0
    └── events.md     # Real-time events (optional)
```

**Phase -1 Gates**:

These gates enforce architectural discipline from the Constitution. All gates must pass before proceeding to implementation. Document justified exceptions in the Complexity Tracking section of the plan.

### speckit_tasks

**Purpose**: Generate a dependency-ordered task breakdown from plan and supporting documents.

**Slash Command**: `/speckit.tasks`

**Keyword Triggers**: `speckit: tasks`, `générer les tâches`, `créer les tâches`

**Parameters** (all optional):

- `planPath`: Path to plan file (auto-detects most recent if not provided)

**Examples**:

```text
speckit: tasks
speckit: générer les tâches
```

**Input Sources**:

| Document | Required | What to Extract |
|----------|----------|------------------|
| `plan.md` | ✅ Yes | Phases, architecture, decisions |
| `data-model.md` | ✅ Yes | Entity CRUD tasks, migrations |
| `contracts/api.yaml` | ✅ Yes | Endpoint implementation tasks |
| `contracts/events.md` | If exists | Event handler tasks |
| `quickstart.md` | ✅ Yes | Validation test tasks |
| `research.md` | If exists | Setup/integration tasks |

**Task Format**:

```
- [ ] T### [P] [US#] Description with file path
```

Where:
- `T###` = Task number (T001, T002...)
- `[P]` = Parallel marker (if task can run in parallel)
- `[US#]` = User Story reference from spec

**Behavior**:

1. Finds the most recent plan and supporting docs in `specs/`
2. Loads prompt from `.spec-kit/prompts/tasks.md`
3. Derives tasks from all input sources
4. Organizes by phase (Setup → Data Layer → API → Events → Testing → Polish)
5. Identifies parallel groups and dependencies
6. Output saved to `specs/tasks.md`

### speckit_implement

**Purpose**: Implement tasks one by one.

**Slash Command**: `/speckit.implement`

**Keyword Triggers**: `speckit: implement`, `implémenter`, `coder`

**Parameters** (all optional):

- `taskId`: Specific task ID to implement (picks next pending if not provided)

**Examples**:

```text
speckit: implement
speckit: implement task 3
speckit: implémenter la tâche 5
```

**Behavior**:

1. Loads tasks from `specs/tasks.md`
2. Finds next pending task (or specified task)
3. Loads prompt from `.spec-kit/prompts/implement.md`
4. Returns context for implementation
5. Updates task status after completion

### speckit_clarify

**Purpose**: Clarify ambiguous requirements.

**Slash Command**: `/speckit.clarify`

**Keyword Triggers**: `speckit: clarify`, `clarifier`, `préciser`

**Parameters** (all optional):

- `specPath`: Path to specification (auto-detects if not provided)
- `questions`: Specific questions to clarify

**Examples**:

```text
speckit: clarify
speckit: clarifier les critères d'acceptation
```

**Behavior**:

1. Finds `[NEEDS CLARIFICATION]` markers
2. Loads prompt from `.spec-kit/prompts/clarify.md`
3. Returns targeted questions for stakeholders

### speckit_help

**Purpose**: Provide help and documentation.

**Slash Command**: `/speckit.help`

**Keyword Triggers**: `speckit: help`, `aide sur speckit`

**Parameters** (all optional):

- `topic`: Specific topic to get help on

**Examples**:

```text
speckit: help
speckit: help workflows
speckit: help comment créer un template ?
```

**Topics covered**:

- Commands and usage
- Customization (prompts, templates, workflows)
- Troubleshooting
- Architecture

### speckit_constitution

**Purpose**: Configure the project constitution with principles, tech stack, and conventions.

**Slash Command**: `/speckit.constitution`

**Keyword Triggers**: `speckit: constitution`, `définir les principes`

**Parameters** (all optional):

- `principles`: Description of project principles or tech stack
- `projectName`: Name of the project

**Examples**:

```text
speckit: constitution
speckit: constitution monorepo TypeScript avec React et Node.js
speckit: constitution avec principes Clean Architecture et TDD
/speckit.constitution pour un projet e-commerce
```

**Behavior**:

1. Loads prompt from `.spec-kit/prompts/constitution.md`
2. Loads template from `.spec-kit/memory/constitution.md` (with `[PLACEHOLDER]` tokens)
3. Fills placeholders based on user input or project detection
4. Returns guidance for completing the constitution

**Constitution Template Structure**:

- `[PROJECT_NAME]` - Name of the project
- `[RATIFICATION_DATE]` - When the constitution was established
- `[PRINCIPLE_X_NAME]` / `[PRINCIPLE_X_DESCRIPTION]` - Project principles
- `[TECH_LANGUAGE]`, `[TECH_FRAMEWORK]`, `[TECH_DATABASE]` - Tech stack
- `[CODING_STYLE]`, `[TESTING_FRAMEWORK]` - Development practices
- `[APPROVER_X]` - List of approvers for changes

### speckit_analyze

**Purpose**: Cross-artifact analysis for consistency and traceability.

**Slash Command**: `/speckit.analyze`

**Keyword Triggers**: `speckit: analyze`, `analyser`, `vérifier cohérence`

**Parameters** (all optional):

- `focusArea`: Area to focus the analysis on
  - `spec-to-plan` - Verify all requirements are covered in plan
  - `plan-to-tasks` - Verify all components have tasks
  - `tasks-to-implementation` - Verify all tasks are implemented
  - `full-traceability` - Complete end-to-end analysis

**Examples**:

```text
speckit: analyze
speckit: analyze spec vers plan
speckit: analyze full-traceability
/speckit.analyze pour vérifier la traçabilité
```

**Behavior**:

1. Loads prompt from `.spec-kit/prompts/analyze.md`
2. Reads all artifacts from `specs/` directory
3. Performs cross-referencing analysis
4. Identifies gaps, orphan items, and inconsistencies
5. Generates analysis report

**Analysis Output**:

- **Traceability Matrix**: Requirements → Plan → Tasks mapping
- **Gap Analysis**: Missing coverage in downstream artifacts
- **Orphan Detection**: Items without upstream references
- **Consistency Issues**: Contradictions between artifacts

### speckit_checklist

**Purpose**: Generate quality checklists for requirements - "unit tests for English".

**Slash Command**: `/speckit.checklist`

**Keyword Triggers**: `speckit: checklist`, `générer checklist`

**Parameters** (all optional):

- `checklistType`: Type of checklist to generate
  - `requirements` - Quality of requirements (default)
  - `acceptance` - Acceptance criteria quality
  - `scenarios` - Scenario coverage
  - `edge-cases` - Edge case coverage
- `focusAreas`: Specific areas to focus on (comma-separated)

**Examples**:

```text
speckit: checklist
speckit: checklist requirements
speckit: checklist edge-cases
/speckit.checklist pour les critères d'acceptation
```

**Behavior**:

1. Loads prompt from `.spec-kit/prompts/checklist.md`
2. Loads template from `.spec-kit/templates/checklist-template.md`
3. Analyzes specification for quality indicators
4. Generates checklist with `[Pass]`, `[Gap]`, or `[N/A]` status
5. Output saved to `specs/checklist.md`

**Checklist Categories**:

- **Requirement Completeness**: Are all necessary details present?
- **Requirement Clarity**: No vague terms (should, may, approximately)?
- **Requirement Consistency**: No contradictions?
- **Acceptance Criteria Quality**: Testable and unambiguous?
- **Scenario Coverage**: Happy path, error cases, edge cases?
- **Edge Case Coverage**: Boundaries, nulls, concurrent access?

### speckit_memory

**Purpose**: Manage project memory and context in `.spec-kit/memory/`.

**Slash Command**: `/speckit.memory`

**Keyword Triggers**: `speckit: memory`, `enrichir la mémoire`, `ajouter au contexte`

**Parameters** (all optional):

- `action`: Action to perform
  - `add` - Add new memory file (default)
  - `update` - Update existing memory file
  - `list` - List all memory files
  - `auto` - Auto-enrich from current context
- `fileName`: Name of the memory file (without .md)
- `content`: Content to add
- `category`: Category for organizing (`decisions`, `conventions`, `architecture`, `learnings`, `context`)

**Examples**:

```text
speckit: memory list
speckit: memory add decisions
speckit: memory auto
speckit: memory update conventions
speckit: memory ajouter une décision technique
```

**Memory Categories**:

- **decisions** - Technical and architectural decisions
- **conventions** - Coding standards and patterns
- **architecture** - System design and structure  
- **learnings** - Lessons learned and best practices
- **context** - Project background and domain knowledge
- **glossary** - Domain terms and definitions

**Behavior**:

1. Lists, creates, or updates files in `.spec-kit/memory/`
2. Structures content with dates and context
3. Auto mode analyzes conversation to extract insights

### speckit_validate

**Purpose**: Validate compliance against customizable rules (security, RGPD, architecture, etc.).

**Slash Command**: `/speckit.validate`

**Keyword Triggers**: `speckit: validate`, `valider`, `vérifier`

**Parameters** (all optional):

- `ruleType`: Type of validation to perform
  - `security` - Validate against security rules (OWASP, encryption, auth...)
  - `rgpd` - Validate GDPR compliance
  - Custom rule file name (e.g., `architecture-rules`)
- `phase`: Phase being validated
  - `spec` - Validating a specification
  - `plan` - Validating a plan
  - `implementation` - Validating code
- `targetPath`: Path to the file/folder to validate

**Examples**:

```text
speckit: validate security
speckit: validate rgpd phase=spec
speckit: valider la sécurité du code
speckit: vérifier conformité RGPD
speckit: validate architecture-rules
```

**Behavior**:

1. Loads rules from `.spec-kit/rules/{ruleType}-rules.md`
2. Loads validation prompt from `.spec-kit/prompts/validate.md`
3. Analyzes target against each rule
4. Generates validation report with checklist
5. Output saved to `specs/validations/{ruleType}-validation-{date}.md`

**Available Rules** (default):

| Rule Type | File | Description |
|-----------|------|-------------|
| `security` | `security-rules.md` | OWASP Top 10, authentication, encryption, API security |
| `rgpd` | `rgpd-rules.md` | GDPR Articles 6, 12-22, 28, 30, 32, 35 compliance |

**Creating Custom Rules**:

Create a new file in `.spec-kit/rules/`:

```markdown
# .spec-kit/rules/my-custom-rules.md

# My Custom Rules

## Category 1

- [ ] **RULE-001**: Rule description
  - Details about the rule
  - How to check compliance

- [ ] **RULE-002**: Another rule
  - Details
```

Then use: `speckit: validate my-custom`

**Validation Report Format**:

```markdown
# Validation Report: Security

**Date**: 2024-01-15
**Phase**: implementation
**Target**: src/auth/

## Summary
- ✅ Compliant: 8
- ⚠️ Partial: 2
- ❌ Non-compliant: 1
- ➖ Not applicable: 1

## Detailed Results
...
```

---

### speckit_workflow

**Purpose**: Manage multi-step workflows (list, start, check status).

**Slash Command**: `/speckit.workflow`

**Keyword Triggers**: `speckit: workflow`, `démarrer un workflow`, `workflow list`

**Parameters** (all optional):

- `action`: Action to perform
  - `list` - Show all available workflows (default)
  - `start` - Start a workflow
  - `status` - Check workflow status
- `workflowName`: Name of workflow to start (required for `start` action)
- `contextId`: Optional context identifier (e.g., work item ID, feature name)
- `auto`: Auto mode - run without approval prompts (default: `false`)

**Examples**:

```text
/speckit.workflow feature-standard Multi-View
/speckit.workflow feature-quick
/speckit.workflow bugfix
/speckit.workflow list
/speckit.workflow status
```

**Simplified Usage**:

Just type the workflow name after `/speckit.workflow`:

- `/speckit.workflow feature-standard` → Starts the standard workflow
- `/speckit.workflow bugfix` → Starts the bugfix workflow
- Any text after the workflow name becomes the `contextId`

**Behavior**:

**Action: list**

1. Scans `.spec-kit/workflows/` (local) and `starter-kit/workflows/` (built-in)
2. Displays table with workflow name, description, and source (🔧 Local / 📦 Built-in)

**Action: start**

1. Validates workflow exists
2. Calls `start_workflow` MCP tool to begin the workflow
3. Workflow will guide through each step automatically

**Action: status**

1. Checks active workflow session
2. Shows current step, completed actions, next required action

**Built-in Workflows**:

| Workflow | Description | Steps |
|----------|-------------|-------|
| `feature-quick` | Quick feature implementation | spec → implement |
| `feature-standard` | Standard feature workflow | spec → plan → tasks → implement |
| `feature-full` | Full feature with validation | spec → security review → RGPD review → plan → tasks → implement |
| `bugfix` | Bug fix with reproduction | reproduce → analyze → fix → test |

**Creating Custom Workflows**:

Create `.spec-kit/workflows/my-workflow.yaml`:

```yaml
name: my-workflow
version: "1.0.0"
description: "My custom workflow"

steps:
  - id: step1
    agent: SpecAgent
    action: call_agent
    params:
      instructions: "Do something..."
```

---

## Customization Guide

### Modifying Prompts

Prompts control how each command behaves. Edit files in `.spec-kit/prompts/`:

```markdown
# .spec-kit/prompts/specify.md

## My Custom Specification Process

1. First, analyze the business need
2. Then identify technical constraints
...
```

Changes take effect immediately - no restart needed.

### Creating Custom Templates

Templates define document structure. Create/edit in `.spec-kit/templates/`:

```markdown
# .spec-kit/templates/my-template.md

# {Title}

## Summary
{summary}

## Requirements
{requirements}

## Technical Notes
{notes}
```

### Creating a New Workflow

Workflows are YAML files defining multi-step processes. All workflows are validated against a schema (`src/schemas/workflowSchema.ts`) to ensure correctness.

```yaml
# .spec-kit/workflows/my-workflow.yaml

name: my-workflow
displayName: "My Custom Workflow"
description: "Does something specific"
template: my-template.md
defaultAgent: SpecAgent

steps:
  - id: step1
    name: "First Step"
    action: call_agent
    agent: SpecAgent
    description: "What this step does"
    inputs:
      - name: input1
        description: "Description"
        required: true
    
  - id: step2
    name: "Second Step"
    action: call_agent
    agent: PlanAgent
    dependsOn: [step1]
    description: "What this step does"
```

**Available actions**:

- `call_agent` - Call an AI agent
- `fetch_ado` - Fetch Azure DevOps work item
- `review` - Review/validation step (security, RGPD, etc.)
- `create_file` - Save artifact to file
- `generate_content` - Generate content without an agent

**Step Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique step identifier |
| `name` | string | Human-readable step name |
| `action` | string | Action type (see above) |
| `agent` | string | Agent to use (SpecAgent, PlanAgent, GovAgent, TestAgent) |
| `description` | string | Instructions for the step |
| `inputs` | array | Input parameters |
| `outputs` | array | Output artifacts |
| `dependsOn` | array | Steps that must complete first |
| `requiresApproval` | boolean | **NEW** - Pause for user approval after this step |
| `approvalMessage` | string | **NEW** - Custom message to show at approval prompt |
| `useSubagent` | boolean | **NEW** - Run in isolated context using VS Code subagent |

### Approval Gates

Use `requiresApproval: true` to create checkpoints in your workflow. This pauses execution and asks the user to review the output before continuing.

```yaml
steps:
  - id: generate-tasks
    name: "Generate Tasks"
    action: call_agent
    agent: PlanAgent
    description: "Break down the plan into tasks"
    outputs:
      - tasks_document
    # Pause here for review
    requiresApproval: true
    approvalMessage: "⚠️ Review tasks before starting implementation"

  - id: implement
    name: "Implement"
    action: call_agent
    agent: SpecAgent
    description: "Implement the tasks"
```

**When to use approval gates**:
- Before implementation phases
- After security/compliance reviews
- Before destructive operations
- At phase transitions (spec → plan → tasks → implement)

### Subagent Execution

Use `useSubagent: true` for steps that benefit from isolated context:

```yaml
steps:
  - id: security-review
    name: "Security Review"
    action: review
    agent: GovAgent
    # Run in isolated context to avoid context pollution
    useSubagent: true
    description: "Deep security analysis"
```

**Benefits of subagents**:
- **Isolated context**: Doesn't pollute main conversation
- **Deep analysis**: Can perform extensive research without cluttering the chat
- **Focused results**: Only the final analysis returns to main context

**Recommended for**:
- Security reviews
- RGPD/compliance analysis
- Code audits
- Deep research tasks

---

## VS Code 1.109+ Features

### Native VS Code Agents (`.agent.md`)

Spec-Kit ships native VS Code agents installed to `.github/agents/`. These are real Copilot Chat agents invokable with `@AgentName`.

| Agent File | Chat Name | Description |
|------------|-----------|-------------|
| `speckit-spec.agent.md` | `@SpecKit-Spec` | Specification writing |
| `speckit-plan.agent.md` | `@SpecKit-Plan` | Technical planning with Mermaid diagrams |
| `speckit-governance.agent.md` | `@SpecKit-Governance` | Security, RGPD, compliance review |
| `speckit-test.agent.md` | `@SpecKit-Test` | Testing strategy |
| `speckit-conductor.agent.md` | `@SpecKit-Conductor` | Orchestrator — delegates to specialist agents |
| `speckit-implement.agent.md` | `@SpecKit-Implement` | Task implementation |

**Agent Frontmatter** (`.agent.md` format):

```yaml
---
name: SpecKit-Conductor
description: Orchestrates spec-driven development by delegating to specialist agents
model:
  - copilot-claude-sonnet-4
  - copilot-gpt-4o
tools:
  - speckit_specify
  - speckit_plan
agents:
  - SpecKit-Spec
  - SpecKit-Plan
user-invokable: true
---
```

**Key Properties**:
- `model`: Array for fallback chain (first available model is used)
- `tools`: MCP tools the agent can call
- `agents`: Sub-agents it can delegate to (via `agent` tool)
- `user-invokable`: Whether users can invoke directly with `@Name`
- `disable-model-invocation`: If true, only the user can invoke this agent

**VS Code Settings** (auto-configured by setup):

```json
{
  "chat.agentFilesLocations": [".github/agents"],
  "chat.agentSkillsLocations": [".github/skills"]
}
```

### Agent Skills (SKILL.md)

Shared knowledge modules in `.github/skills/`:

| Skill | Directory | Description |
|-------|-----------|-------------|
| **Spec-Driven Dev** | `spec-driven-dev/` | Complete spec-driven methodology |
| **Security Validation** | `security-validation/` | OWASP security framework |
| **API Design** | `api-design/` | REST API and data model patterns |

Skills are auto-discovered and available to all agents.

### MCP Apps (Interactive Dashboards)

Two new MCP tools provide rich interactive visualizations:

#### `speckit_dashboard`

Generates an interactive workflow progress dashboard:
- Workflow step status (done/active/pending)
- Requirements and task counts
- Coverage percentage with visual bar
- Quality status indicators

**Usage**: `speckit: dashboard` or call the `speckit_dashboard` tool.

#### `speckit_traceability`

Generates an interactive traceability matrix:
- Requirement-to-task mapping with status
- Coverage summary (covered/partial/uncovered)
- Uses requirement IDs (FR-XXX, NFR-XXX) from specs

**Usage**: `speckit: traceability` or call the `speckit_traceability` tool.

### Copilot Memory (Dual Architecture)

Spec-Kit uses two memory layers:

| Layer | Scope | Storage | Purpose |
|-------|-------|---------|----------|
| **Native Copilot Memory** | Personal, cross-session | VS Code | Preferences, coding style, habits |
| **Spec-Kit Memory** | Project, team-shared | `.spec-kit/memory/` (git) | Decisions, conventions, domain knowledge |

**Enable**: `"github.copilot.chat.copilotMemory.enabled": true` in VS Code settings.

**Guidelines**:
- Personal preferences → Native Copilot Memory (automatic)
- Team decisions → `.spec-kit/memory/` via `speckit_memory`
- Project constitution → Always in `.spec-kit/memory/constitution.md`

### Search Subagent

Prompts now include guidance for using `runSubagent` to explore codebases:
- Preserves main context window by delegating searches
- Used in plan, implement, and analyze prompts
- Returns focused summaries instead of raw file contents

**Example**: During planning, the search subagent scans for existing patterns, models, and test approaches before architectural decisions are made.

### askQuestions Tool

Prompts now leverage `askQuestions` for structured interactive UX:
- **clarify.md**: Batched clarification questions with options
- **specify.md**: Handles ambiguity with structured disambiguation
- **constitution.md**: Interactive project setup with multiSelect
- **implement.md**: Task iteration (Continue/Review/Run tests/Stop)

**Available Agents** (System Prompts):

⚠️ **Important Note**: These are NOT GitHub Copilot agents. They are **predefined system prompts** that guide Copilot's behavior for each workflow step.

- **`SpecAgent`** - Writes specifications and analyzes requirements
- **`PlanAgent`** - Creates technical plans and decomposes tasks
- **`GovAgent`** - Validates governance, security, and compliance
- **`TestAgent`** - Creates test strategies and test cases

### Understanding Spec-Kit Agents

Spec-Kit's "agents" are **NOT** registered agents in GitHub Copilot. Instead, they are:

1. **System Prompts** - Instructions defined in TypeScript (`src/prompts/agents.ts`)
2. **Role Definitions** - Each agent has specific expertise and guidelines
3. **Behavioral Guides** - They shape how Copilot responds to specific tasks

**How They Work**:

When a workflow step specifies an agent:

```yaml
steps:
  - id: plan
    agent: PlanAgent  # ← Uses PlanAgent's system prompt
    action: call_agent
    description: "Create implementation plan"
```

Spec-Kit:

1. Looks up the system prompt for `PlanAgent`
2. Sends it to Copilot along with the task
3. Copilot responds following that agent's guidelines

**Why Use Agents?**

Different tasks need different expertise:

```yaml
steps:
  - id: analyze-bug          # ← No agent = general purpose
    action: fetch_ado
    
  - id: create-fix-plan      # ← Use PlanAgent = focused planning
    agent: PlanAgent
    action: call_agent
    
  - id: security-review      # ← Use GovAgent = security focus
    agent: GovAgent
    action: review
```

Each agent brings specialized guidelines to shape Copilot's response appropriately.

**Customizing Agents**:

Agents are now **fully customizable** from `.spec-kit/agents/`. You can:

1. **Override built-in agents**: Create a file with the same name (e.g., `SpecAgent.md`)
2. **Create new agents**: Create a new file (e.g., `SecurityAgent.md`)

**Agent File Format** (Markdown with YAML frontmatter):

```markdown
---
name: MyCustomAgent
displayName: "My Custom Agent"
description: "Expert in your specific domain"
capabilities:
  - Your first capability
  - Your second capability
---

## System Prompt

You are MyCustomAgent, an expert in [your domain]...

### Guidelines
- Guideline 1
- Guideline 2
```

**Example: Creating a SecurityAgent**:

```markdown
---
name: SecurityAgent
displayName: "Security Review Agent"
description: "Expert in application security and vulnerability assessment"
capabilities:
  - Identify security vulnerabilities
  - Recommend secure coding practices
  - Review authentication and authorization
  - Check for OWASP Top 10 issues
---

## System Prompt

You are SecurityAgent, an expert in application security...

### Your Role
Review code and specifications for security vulnerabilities...
```

Then use in your workflow:

```yaml
steps:
  - id: security-review
    agent: SecurityAgent  # Your custom agent!
    action: call_agent
    description: "Review code for security issues"
```

**Resolution Order**:
1. `.spec-kit/agents/AgentName.md` (local override - takes priority)
2. Built-in agents from package (fallback)

Changes take effect immediately - no restart needed.

### Workflow Validation Schema

Every workflow YAML is automatically validated using Zod schema (`src/schemas/workflowSchema.ts`). This ensures all workflows follow the required structure and catches errors early.

**Required Top-Level Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Workflow identifier (kebab-case recommended) |
| `displayName` | string | User-readable display name |
| `description` | string | What this workflow accomplishes |
| `template` | string | Associated template file (e.g., `functional-spec.md`) |
| `steps` | array | Array of steps (min. 1 step required) |

**Optional Top-Level Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `defaultAgent` | string | Default agent for all steps (default: `SpecAgent`) |
| `metadata` | object | Version, author, created, tags |

**Step Schema** (each object in the `steps` array):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique step identifier within workflow |
| `name` | string | ✅ | Human-readable step name |
| `action` | enum | ✅ | Action type: `call_agent`, `fetch_ado`, `generate_content`, `review`, `create_file` |
| `description` | string | ✅ | What this step does |
| `agent` | string | ❌ | Agent to use (overrides `defaultAgent`) |
| `inputs` | object | ❌ | Input parameters for this step |
| `outputs` | array | ❌ | Expected output types |
| `next` | string | ❌ | Next step ID (for non-sequential workflows) |

**Valid Example Workflow**:

```yaml
name: analysis-workflow
displayName: "Analysis Workflow"
description: "Analyze requirements and create a specification"
template: functional-spec.md
defaultAgent: SpecAgent
metadata:
  version: "1.0"
  author: "Team"

steps:
  - id: gather
    name: "Gather Requirements"
    action: call_agent
    description: "Collect and document requirements"
    outputs:
      - requirements.md

  - id: analyze
    name: "Analyze"
    action: call_agent
    agent: SpecAgent
    description: "Analyze gathered requirements"
    inputs:
      requirements: requirements.md
    outputs:
      - analysis.md

  - id: draft-spec
    name: "Draft Specification"
    action: generate_content
    description: "Generate specification from analysis"
    inputs:
      analysis: analysis.md
    outputs:
      - spec.md
```

**Validation Errors**:

When a workflow violates the schema, you'll get a detailed error message:

```text
Error: Invalid workflow "my-workflow":
  - steps.0.action: Invalid enum value. Expected 'call_agent' | 'fetch_ado' | 'generate_content' | 'review' | 'create_file'
  - displayName: Required
  - name: String must contain at least 1 character(s)
```

**Common Validation Issues**:

1. **Missing required field**

   ```text
   Error: name: Required
   ```

   → Add the missing field

2. **Invalid action type**

   ```text
   Error: steps.0.action: Invalid enum value
   ```

   → Use one of: `call_agent`, `fetch_ado`, `generate_content`, `review`, `create_file`

3. **Empty steps array**

   ```text
   Error: steps: Array must contain at least 1 element(s)
   ```
   → Add at least one step

4. **Duplicate step IDs**
   → Each `steps[i].id` must be unique within the workflow

5. **Invalid step without required fields**

   ```text
   Error: steps.2.description: Required
   ```
   → Ensure each step has `id`, `name`, `action`, and `description`

**Schema Location**:

- **Source**: `src/schemas/workflowSchema.ts` (TypeScript Zod definitions)
- **Validation**: Automatic when loading workflows via `loadWorkflow()` in `src/utils/workflowLoader.ts`
- **Error Handling**: Invalid workflows throw descriptive errors before execution

### Editing the Constitution

The constitution defines project principles. Edit `.spec-kit/memory/constitution.md`:

```markdown
# Project Constitution

## Technical Stack
- Language: TypeScript
- Framework: React + Node.js
- Database: PostgreSQL
- Testing: Jest + Playwright

## Development Principles
1. Clean Architecture - separate concerns
2. Test-Driven Development
3. Code review required for all changes
4. Documentation as code

## Naming Conventions
- Files: kebab-case
- Components: PascalCase
- Functions: camelCase

## API Guidelines
- RESTful design
- Version in URL (/api/v1/)
- JSON responses
```

---

## Troubleshooting

### Commands Not Working

1. **Check MCP configuration** in `.vscode/settings.json`:

```json
{
  "mcp": {
    "servers": {
      "spec-kit": {
        "command": "npx",
        "args": ["-y", "smart-spec-kit-mcp"]
      }
    }
  }
}
```

2. **Reload VS Code**: `Ctrl+Shift+P` → "Developer: Reload Window"

3. **Check copilot-instructions.md exists** at `.github/copilot-instructions.md`

### Setup Not Finding Files

Run setup with the project path:

```bash
npx smart-spec-kit-mcp setup --project /path/to/project
```

### Prompts Not Loading

1. Check files exist in `.spec-kit/prompts/`
2. Ensure valid Markdown format
3. Run setup again to reinstall:

```bash
npx smart-spec-kit-mcp setup --project . --force
```

### Templates Not Applied

1. Check files in `.spec-kit/templates/`
2. Verify template name matches reference

---

## Workflow Reference

### feature-quick

Lightweight workflow for quick wins and simple features.

**Best for**: Small features, quick wins, simple changes

**Steps**:

1. Quick spec (minimal documentation)
2. Implement directly
3. Auto-update memory

**Example**:

```text
speckit: start_workflow workflow_name="feature-quick"
```

### feature-standard

Standard feature specification workflow.

**Steps**:

1. Fetch requirements
2. Generate specification
3. Create plan
4. Generate tasks
5. Review

### feature-full

Complete workflow with governance.

**Steps**:

1. Fetch requirements
2. Generate specification
3. Security review
4. GDPR compliance check
5. Architecture review
6. Create plan
7. Generate tasks
8. Test strategy
9. Implementation
10. Final review

### bugfix

Bug fix workflow.

**Steps**:

1. Fetch bug report
2. Root cause analysis
3. Fix plan
4. Implementation
5. Regression tests

---

## Auto-Memory Enrichment

After each feature or bugfix implementation, Spec-Kit **automatically** enriches project memory with relevant learnings.

### What Gets Captured

| Category | File | Content |
|----------|------|---------|
| **Decisions** | `decisions.md` | Architectural and technical decisions |
| **Conventions** | `conventions.md` | Coding patterns and standards |
| **Learnings** | `learnings.md` | Lessons learned, gotchas, insights |

### Memory Entry Format

```markdown
## {Type}: {Title}
**Date:** YYYY-MM-DD
**Context:** Which task/feature triggered this
**Description:** What was decided/learned
**Rationale:** Why - the reasoning behind it
```

### Example Entry

```markdown
## Decision: Use Repository Pattern for Data Access
**Date:** 2024-01-30
**Context:** Task #3 - Implement user authentication
**Description:** Created UserRepository interface with InMemory and SQL implementations
**Rationale:** Allows easy testing and future database changes without affecting business logic
```

### Benefits

- **Knowledge retention**: Project learnings are preserved
- **Onboarding**: New team members can learn from history
- **Consistency**: Decisions are documented and traceable
- **AI context**: Future Copilot sessions have richer context

---

## Best Practices

### Writing Good Requirements

- Be specific about user needs
- Include acceptance criteria
- Define edge cases
- Reference related features

### Effective Specifications

- Start with the "why" (business value)
- Define clear scope (in/out)
- Use Given/When/Then for criteria
- Document assumptions

### Task Breakdown

- Atomic tasks (1-4 hours each)
- Clear acceptance criteria
- Explicit dependencies
- Testable outcomes

---

## FAQ

**Q: Can I use Spec-Kit without Azure DevOps?**
A: Yes! Azure DevOps integration is optional. You can provide requirements directly.

**Q: How do I add a new agent?**
A: Create a `.agent.md` file in `.github/agents/` for native VS Code agents, or a Markdown file in `.spec-kit/agents/` for MCP system prompts. See [VS Code 1.109+ Features](#vs-code-1109-features) for details.

**Q: What's the difference between native agents and Spec-Kit agents?**
A: Native agents (`.agent.md` in `.github/agents/`) are real VS Code Chat participants invokable with `@Name`. Spec-Kit agents (`.spec-kit/agents/`) are system prompts used by MCP tools in workflows. Both complement each other.

**Q: Can multiple people use Spec-Kit on the same project?**
A: Yes! All configuration is in the project directory and can be version-controlled.

**Q: How do I update Spec-Kit?**
A: Run `npx smart-spec-kit-mcp@latest setup` to get the latest version.

**Q: Can I use my own templates?**
A: Yes! Add templates to `.spec-kit/templates/` and reference them in workflows.
