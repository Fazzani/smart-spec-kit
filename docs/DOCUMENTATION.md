# Spec-Kit Documentation

This is the comprehensive documentation for Spec-Kit. Copilot can read this file to answer user questions.

## Overview

Spec-Kit is an MCP (Model Context Protocol) server that provides **Prompt-as-Code** functionality for specification-driven development. It integrates with GitHub Copilot in VS Code to guide developers through creating specifications, plans, tasks, and implementation.

## Architecture

### Components

1. **MCP Server** (`smart-spec-kit-mcp`)
   - Runs as a background process
   - Exposes tools via Model Context Protocol
   - Communicates with GitHub Copilot

2. **Copilot Instructions** (`.github/copilot-instructions.md`)
   - Tells Copilot how to use Spec-Kit tools
   - Defines command keywords and aliases

3. **Prompts** (`.spec-kit/prompts/`)
   - Prompt-as-Code files read by MCP tools
   - Define behavior for each command
   - Customizable per project

4. **Templates** (`.spec-kit/templates/`)
   - Document templates for specs, plans, tasks
   - Markdown format

5. **Constitution** (`.spec-kit/memory/constitution.md`)
   - Project principles and conventions
   - Technical stack definition
   - Development guidelines

6. **Workflows** (`.spec-kit/workflows/`)
   - YAML-based workflow definitions
   - Multi-step automated processes

---

## MCP Tools

> **Note**: All parameters are optional. Spec-Kit is designed to be conversational - if you don't provide information upfront, Copilot will ask for it.

### speckit_specify

**Purpose**: Create a functional specification from requirements.

**Triggers**: `speckit: spec`, `speckit: specify`, `créer une spec`

**Parameters** (all optional):
- `requirements`: What you want to build. Can be:
  - A feature description: "user authentication with email/password"
  - A user story: "As a user, I want to..."
  - An Azure DevOps work item ID: "#12345"
- `contextId`: ID for the specification filename

**Examples**:
```
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

**Triggers**: `speckit: plan`, `planifier`, `créer un plan`

**Parameters** (all optional):
- `specPath`: Path to specification file (auto-detects most recent if not provided)

**Examples**:
```
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

**Triggers**: `speckit: tasks`, `générer les tâches`, `créer les tâches`

**Parameters** (all optional):
- `planPath`: Path to plan file (auto-detects most recent if not provided)

**Examples**:
```
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

**Triggers**: `speckit: implement`, `implémenter`, `coder`

**Parameters** (all optional):
- `taskId`: Specific task ID to implement (picks next pending if not provided)

**Examples**:
```
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

**Triggers**: `speckit: clarify`, `clarifier`, `préciser`

**Parameters** (all optional):
- `specPath`: Path to specification (auto-detects if not provided)
- `questions`: Specific questions to clarify

**Examples**:
```
speckit: clarify
speckit: clarifier les critères d'acceptation
```

**Behavior**:
1. Finds `[NEEDS CLARIFICATION]` markers
2. Loads prompt from `.spec-kit/prompts/clarify.md`
3. Returns targeted questions for stakeholders

### speckit_help

**Purpose**: Provide help and documentation.

**Triggers**: `speckit: help`, `aide sur speckit`

**Parameters** (all optional):
- `topic`: Specific topic to get help on

**Examples**:
```
speckit: help
speckit: help workflows
speckit: help comment créer un template ?
```

**Topics covered**:
- Commands and usage
- Customization (prompts, templates, workflows)
- Troubleshooting
- Architecture

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

Workflows are YAML files defining multi-step processes:

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

**Available agents**:
- `SpecAgent` - Writes specifications
- `PlanAgent` - Creates plans
- `GovAgent` - Validates governance
- `TestAgent` - Creates test strategies

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
