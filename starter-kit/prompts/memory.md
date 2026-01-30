# Memory Management Prompt

## Purpose
Manage and enrich the project memory in `.spec-kit/memory/`.

## Memory Categories

### 1. Decisions (`decisions.md`)
Record technical and architectural decisions using ADR format:
- **Context**: What prompted the decision
- **Decision**: What was decided
- **Consequences**: Impact and trade-offs
- **Date**: When it was decided

### 2. Conventions (`conventions.md`)
Document coding standards and patterns:
- Naming conventions
- Code organization
- API patterns
- Error handling

### 3. Architecture (`architecture.md`)
System design documentation:
- Component diagrams
- Data flow
- Integration points
- Scaling considerations

### 4. Learnings (`learnings.md`)
Lessons learned during development:
- What worked well
- What didn't work
- Best practices discovered
- Performance insights

### 5. Context (`context.md`)
Project background:
- Business domain
- Stakeholders
- Constraints
- Dependencies

### 6. Glossary (`glossary.md`)
Domain terminology:
- Term definitions
- Acronyms
- Business concepts

## Format Guidelines

Use consistent markdown structure:

```markdown
## Entry Title
**Date:** YYYY-MM-DD
**Category:** {category}
**Author:** {optional}

### Context
{Background information}

### Content
{Main content}

### Related
- Link to related entries
- References
```

## Auto-Enrichment

When using `auto` mode:
1. Analyze the current conversation
2. Identify decisions, learnings, or conventions
3. Extract key insights
4. Save to appropriate memory file
5. Maintain chronological order

## Best Practices

1. **Be Specific**: Include enough context for future reference
2. **Date Everything**: Always include timestamps
3. **Link Related**: Cross-reference related entries
4. **Keep Updated**: Review and update outdated entries
5. **Stay Organized**: Use consistent categories and formats
