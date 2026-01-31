# Copilot Instructions for Spec-Kit

This project uses **Spec-Kit** for specification-driven development. Spec-Kit provides MCP tools and slash commands to guide you through a structured workflow from requirements to implementation.

## Slash Commands (Recommended)

Users can type `/speckit.` to see available slash commands:

| Slash Command | MCP Tool | Description |
|---------------|----------|-------------|
| `/speckit.specify` | `speckit_specify` | Create a functional specification |
| `/speckit.plan` | `speckit_plan` | Create an implementation plan |
| `/speckit.tasks` | `speckit_tasks` | Generate task breakdown |
| `/speckit.implement` | `speckit_implement` | Implement tasks |
| `/speckit.clarify` | `speckit_clarify` | Clarify requirements |
| `/speckit.validate` | `speckit_validate` | Validate compliance (security, RGPD, etc.) |
| `/speckit.memory` | `speckit_memory` | Manage project memory |
| `/speckit.workflow` | `start_workflow` | Start an automated workflow |
| `/speckit.help` | `speckit_help` | Get help and documentation |

## Keyword Commands (Alternative)

When the user mentions **"speckit:"** followed by a command, or uses these keywords in French/English, call the corresponding MCP tool:

| User Says | MCP Tool | Description |
|-----------|----------|-------------|
| `speckit: spec`, `speckit: specify`, `créer une spec` | `speckit_specify` | Create a functional specification |
| `speckit: plan`, `planifier`, `créer un plan` | `speckit_plan` | Create an implementation plan |
| `speckit: tasks`, `générer les tâches`, `créer les tâches` | `speckit_tasks` | Generate task breakdown |
| `speckit: implement`, `implémenter`, `coder` | `speckit_implement` | Implement tasks |
| `speckit: clarify`, `clarifier`, `préciser` | `speckit_clarify` | Clarify requirements |
| `speckit: validate`, `valider`, `vérifier` | `speckit_validate` | Validate compliance (security, RGPD, etc.) |
| `speckit: memory`, `enrichir la mémoire`, `ajouter au contexte` | `speckit_memory` | Manage project memory |
| `speckit: workflow feature-standard`, `démarrer workflow` | `start_workflow` | Start an automated workflow |
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
.github/
└── prompts/           # Slash commands for Copilot
    ├── speckit.specify.prompt.md
    ├── speckit.plan.prompt.md
    ├── speckit.tasks.prompt.md
    ├── speckit.implement.prompt.md
    ├── speckit.clarify.prompt.md
    ├── speckit.validate.prompt.md
    ├── speckit.memory.prompt.md
    └── speckit.help.prompt.md

.spec-kit/
├── prompts/           # Customizable prompts (define command behavior)
│   ├── specify.md
│   ├── plan.md
│   ├── tasks.md
│   ├── implement.md
│   ├── clarify.md
│   ├── validate.md
│   └── memory.md
├── templates/         # Document templates
│   ├── functional-spec.md
│   ├── plan-template.md
│   └── tasks-template.md
├── rules/             # Validation rules
│   ├── security-rules.md
│   └── rgpd-rules.md
├── memory/            # Project context
│   └── constitution.md
└── workflows/         # Automated workflows
    └── feature-quick.yaml  # Quick wins (lightweight)

specs/                 # Generated specifications (output)
└── validations/       # Validation reports
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

## Automated Workflows

Workflows automate multi-step processes. Use `/speckit.workflow` or `start_workflow`:

| Workflow | Description |
|----------|-------------|
| `feature-quick` | Quick win: spec → implement |
| `feature-standard` | Standard: spec → plan → tasks → implement |
| `feature-full` | Complete with security/RGPD validations |
| `bugfix` | Bug fix with reproduction |

### Examples

- `/speckit.workflow feature-standard Multi-View` → Start standard workflow for "Multi-View"
- `/speckit.workflow feature-quick` → Start quick workflow
- `/speckit.workflow bugfix` → Start bugfix workflow

**Auto Mode**: Add `auto=true` to proceed without approval prompts.

## Example Interactions

**User**: `/speckit.specify système de notifications push`
**Action**: Call `speckit_specify` with `requirements: "système de notifications push"`

**User**: `/speckit.plan`  
**Action**: Call `speckit_plan` (will find the most recent spec automatically)

**User**: `/speckit.implement task 3`
**Action**: Call `speckit_implement` with `taskId: "3"`

**User**: `/speckit.memory list`
**Action**: Call `speckit_memory` with `action: "list"`

**User**: `/speckit.validate security`
**Action**: Call `speckit_validate` with `ruleType: "security"`

**User**: `/speckit.workflow feature-standard Multi-View`
**Action**: Call `start_workflow` with `workflow_name: "feature-standard"`, `context_id: "Multi-View"`

**User**: `/speckit.help workflows`
**Action**: Call `speckit_help` with `topic: "workflows"`

**User**: "Comment fonctionne spec-kit ?"
**Action**: Call `speckit_help` without topic for general help
