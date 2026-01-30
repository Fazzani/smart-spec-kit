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

## 5. Status Updates

After implementing, update the task in `specs/tasks.md`:
- Change status from "Not Started" to "Done"
- Add any notes about implementation decisions

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

## 8. Iteration

Ask the user:
- "Task {ID} completed. Continue with {next task}? (yes/no)"
- If yes, proceed with next task
- If no, summarize progress made
