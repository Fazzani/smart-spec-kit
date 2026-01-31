---
description: "Create or update the project constitution with governing principles"
mode: speckit.constitution
---

# /speckit.constitution

Create or update the project constitution from interactive or provided principle inputs.

## Instructions

Use the MCP tool `speckit_constitution` with the user's input to create or update the project constitution.

If no arguments are provided, guide the user interactively to define:
1. Project name
2. Core principles (3-5 recommended)
3. Tech stack guidelines
4. Coding conventions
5. Governance rules

## Arguments

$ARGUMENTS

## Context

The constitution file is at `.spec-kit/memory/constitution.md`. It defines:
- **Core Principles**: Non-negotiable rules that guide all development
- **Tech Stack Guidelines**: Preferred technologies and conventions
- **Governance**: How principles can be amended

## Examples

```text
/speckit.constitution Create principles focused on security, testing, and performance
/speckit.constitution Add a new principle for accessibility compliance
/speckit.constitution Update the tech stack to include React and TypeScript
```

## Next Steps

After creating/updating the constitution:
- Review the principles with your team
- Use `/speckit.specify` to create specifications that respect these principles
- The constitution will be automatically referenced during validation
