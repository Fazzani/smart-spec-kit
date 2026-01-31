# Implement Prompt

You are implementing tasks from the task breakdown. Follow this structured approach:

## 1. Task Selection

If no specific task ID provided:
- Find the first task with status "Not Started"
- Check dependencies are satisfied (all dependent tasks are "Done")
- If dependencies not met, suggest which task to do instead

## 2. Before Implementation

Read and understand:
- The task description and acceptance criteria
- The original specification (for context)
- The project constitution (for conventions)
- Related code files

## 3. Implementation Guidelines

### Code Quality
- Follow project conventions from constitution
- Write clean, self-documenting code
- Add comments for complex logic only
- Follow existing patterns in the codebase

### Testing
- Write tests alongside implementation
- Cover happy path and edge cases
- Follow existing test patterns

### Error Handling
- Handle errors gracefully
- Provide meaningful error messages
- Log appropriately

## 4. Implementation Process

For each task:

1. **Read** the task requirements
2. **Identify** files to create/modify
3. **Implement** the changes
4. **Verify** acceptance criteria are met
5. **Update** task status in tasks.md

## 5. Status Updates (MANDATORY)

**⚠️ CRITICAL: After EACH task implementation, you MUST update the tasks.md file.**

### How to update:

**Before** (unchecked):
```markdown
- [ ] **T001** [P1] 'lib/features/...' **Description**
```

**After** (checked):
```markdown
- [x] **T001** [P1] 'lib/features/...' **Description** ✅ Done (2026-01-31)
```

### Update process:

1. Open the `tasks.md` file (in `specs/` or feature folder)
2. Find the task you just completed
3. Change `- [ ]` to `- [x]`
4. Add `✅ Done (YYYY-MM-DD)` at the end
5. Save the file

**DO NOT skip this step. The task is not complete until tasks.md is updated.**

## 6. Commit Guidelines

Suggest a commit message following format:
```
feat({scope}): {short description}

- {detail 1}
- {detail 2}

Task: {task ID}
```

## 7. Output

Report:
- What was implemented
- Files created/modified
- Any deviations from plan
- Next task to implement (if continuing)

## 8. Auto-Enrich Memory

After each implementation, **automatically** save relevant learnings to `.spec-kit/memory/`:

### What to capture:

**Decisions** (save to `decisions.md`):
- Architectural choices made during implementation
- Technology/library selections
- Trade-offs considered

**Conventions** (save to `conventions.md`):
- New patterns established
- Code conventions discovered or enforced
- Best practices applied

**Learnings** (save to `learnings.md`):
- Problems encountered and solutions found
- Performance insights
- Gotchas or edge cases discovered

### Format for memory entries:

```markdown
## {Type}: {Title}
**Date:** {YYYY-MM-DD}
**Context:** {Brief context - which task/feature}
**Description:** {What was decided/learned}
**Rationale:** {Why - reasoning behind it}
```

### Example:

```markdown
## Decision: Use Repository Pattern for Data Access
**Date:** 2024-01-30
**Context:** Task #3 - Implement user authentication
**Description:** Created UserRepository interface with InMemory and SQL implementations
**Rationale:** Allows easy testing and future database changes without affecting business logic
```

## 9. Iteration

Ask the user:
- "Task {ID} completed. Continue with {next task}? (yes/no)"
- If yes, proceed with next task
- If no, summarize progress made
