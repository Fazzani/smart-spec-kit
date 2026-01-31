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
   - Document templates for specs, plans, tasks
   - Markdown format

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

---

## MCP Tools

> **Note**: All parameters are optional. Spec-Kit is designed to be conversational - if you don't provide information upfront, Copilot will ask for it.

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

**Purpose**: Create an implementation plan from a specification.

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
3. Returns context for generating the plan
4. Output saved to `specs/plan.md`

### speckit_tasks

**Purpose**: Generate a task breakdown from a plan.

**Slash Command**: `/speckit.tasks`

**Keyword Triggers**: `speckit: tasks`, `générer les tâches`, `créer les tâches`

**Parameters** (all optional):

- `planPath`: Path to plan file (auto-detects most recent if not provided)

**Examples**:

```text
speckit: tasks
speckit: générer les tâches
```

**Behavior**:

1. Finds the most recent plan in `specs/`
2. Loads prompt from `.spec-kit/prompts/tasks.md`
3. Returns context for generating tasks
4. Output saved to `specs/tasks.md`

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
- `save_artifact` - Save to file
- `validate` - Validate output

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

Edit system prompts in `src/prompts/agents.ts`:

```typescript
export const SpecAgent: AgentDefinition = {
  name: "SpecAgent",
  displayName: "Specification Agent",
  description: "...",
  systemPrompt: `You are SpecAgent, an expert technical writer...
    // Your custom guidelines here
  `,
  capabilities: [...]
};
```

Changes take effect on the next workflow execution. No registration needed - agents are internal to Spec-Kit.

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
A: Agents are defined in the source code. For custom behavior, modify prompts instead.

**Q: Can multiple people use Spec-Kit on the same project?**
A: Yes! All configuration is in the project directory and can be version-controlled.

**Q: How do I update Spec-Kit?**
A: Run `npx smart-spec-kit-mcp@latest setup` to get the latest version.

**Q: Can I use my own templates?**
A: Yes! Add templates to `.spec-kit/templates/` and reference them in workflows.
