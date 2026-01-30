# Copilot Instructions for Spec-Kit

This project uses **Spec-Kit** for specification-driven development. Spec-Kit provides MCP tools to guide you through a structured workflow from requirements to implementation.

## How to Use Spec-Kit

When the user mentions **"speckit:"** followed by a command, or uses these keywords in French/English, call the corresponding MCP tool:

| User Says | MCP Tool | Description |
|-----------|----------|-------------|
| `speckit: spec`, `speckit: specify`, `créer une spec` | `speckit_specify` | Create a functional specification |
| `speckit: plan`, `planifier`, `créer un plan` | `speckit_plan` | Create an implementation plan |
| `speckit: tasks`, `générer les tâches`, `créer les tâches` | `speckit_tasks` | Generate task breakdown |
| `speckit: implement`, `implémenter`, `coder` | `speckit_implement` | Implement tasks |
| `speckit: clarify`, `clarifier`, `préciser` | `speckit_clarify` | Clarify requirements |
| `speckit: memory`, `enrichir la mémoire`, `ajouter au contexte` | `speckit_memory` | Manage project memory |
| `speckit: help`, `aide sur speckit`, questions about spec-kit | `speckit_help` | Get help and documentation |

## Getting Help

When the user asks questions about Spec-Kit (how to use it, how to customize, how to create workflows, troubleshooting), call `speckit_help` with the relevant topic:

**Examples**:
- "speckit: help comment créer un workflow ?" → `speckit_help` with topic: "workflows"
- "Comment personnaliser les templates spec-kit ?" → `speckit_help` with topic: "templates"
- "speckit aide" → `speckit_help` without topic (general help)

## Workflow

The typical spec-kit workflow is:

```
speckit_specify → speckit_plan → speckit_tasks → speckit_implement
                      ↑
               speckit_clarify (if needed)
```

1. **Specify**: Transform requirements into a structured specification
2. **Plan**: Create a technical implementation plan from the spec
3. **Tasks**: Break down the plan into atomic, actionable tasks  
4. **Implement**: Execute tasks one by one
5. **Clarify**: Resolve ambiguities at any point

## Project Structure

```
.spec-kit/
├── prompts/           # Customizable prompts (define command behavior)
│   ├── specify.md
│   ├── plan.md
│   ├── tasks.md
│   ├── implement.md
│   ├── clarify.md
│   └── memory.md
├── templates/         # Document templates
│   ├── functional-spec.md
│   ├── plan-template.md
│   └── tasks-template.md
├── memory/            # Project context
│   └── constitution.md
└── workflows/         # Automated workflows

specs/                 # Generated specifications (output)
```

## Important Conventions

When using spec-kit:

1. **Always read the constitution** (`.spec-kit/memory/constitution.md`) for project principles
2. **Follow the templates** in `.spec-kit/templates/`
3. **Save outputs to `specs/`** directory
4. **Suggest the next step** after each tool completes

## Tool Response Format

After calling a spec-kit tool, follow the instructions in the tool response. The response will include:
- Context from prompts and templates
- User input
- Specific instructions for what to generate
- Suggested next step

## Automated Workflows (Optional)

For multi-step automation, use `start_workflow`:

| User Says | Action |
|-----------|--------|
| `speckit: start_workflow workflow_name="feature-standard" PiP Support` | Start feature workflow for PiP Support |
| `speckit: start_workflow workflow_name="bugfix" auto=true` | Start bugfix workflow in AUTO mode |

**Auto Mode** (`auto=true`): Proceeds through all steps without asking for user approval. Default is `false` (manual approval required).

## Example Interactions

**User**: "speckit: créer une spec pour un système de notifications push"
**Action**: Call `speckit_specify` with `requirements: "système de notifications push"`

**User**: "speckit: planifier l'implémentation"  
**Action**: Call `speckit_plan` (will find the most recent spec automatically)

**User**: "speckit: implement task 3"
**Action**: Call `speckit_implement` with `taskId: "3"`

**User**: "speckit: memory list"
**Action**: Call `speckit_memory` with `action: "list"`

**User**: "speckit: memory ajouter une décision technique"
**Action**: Call `speckit_memory` with `action: "add"`, `category: "decisions"`

**User**: "speckit: memory auto"
**Action**: Call `speckit_memory` with `action: "auto"` to auto-enrich from context

**User**: "speckit: start_workflow workflow_name="feature-standard" PiP Support auto=true"
**Action**: Call `start_workflow` with `workflow_name: "feature-standard"`, `context_id: "PiP Support"`, `auto: true`

**User**: "speckit: help comment créer un nouveau workflow ?"
**Action**: Call `speckit_help` with `topic: "workflows"`

**User**: "Comment fonctionne spec-kit ?"
**Action**: Call `speckit_help` without topic for general help
