# Tasks Prompt

You are generating a detailed task breakdown from an implementation plan. Follow this structured approach:

## 1. Understand the Plan

Read and analyze:
- All phases and their objectives
- Deliverables per phase
- Dependencies between phases
- Technical decisions made

## 2. Task Decomposition Principles

Create tasks that are:
- **Atomic**: One clear deliverable
- **Actionable**: Clear what to do
- **Testable**: Has acceptance criteria
- **Sized**: Completable in 1-4 hours

## 3. Task Structure

For each task include:

```markdown
### Task {ID}: {Short Title}

**Phase**: {phase name}
**Priority**: {P0-Critical / P1-High / P2-Medium / P3-Low}
**Estimate**: {1h / 2h / 4h}
**Dependencies**: {task IDs or "None"}

**Description**:
{What needs to be done}

**Acceptance Criteria**:
- [ ] {Criterion 1}
- [ ] {Criterion 2}

**Files to modify**:
- `path/to/file.ts`

**Status**: {Not Started / In Progress / Done}
```

## 4. Task Categories

Group tasks by type:
- 🏗️ **Setup/Infrastructure**
- 📦 **Core Implementation**
- 🔌 **Integration**
- 🧪 **Testing**
- 📚 **Documentation**
- 🎨 **UI/UX** (if applicable)

## 5. Dependency Graph

Ensure:
- No circular dependencies
- Critical path is identified
- Parallel work opportunities are marked

## 6. Priority Guidelines

- **P0-Critical**: Blocks all other work
- **P1-High**: Core feature, must be done
- **P2-Medium**: Important but not blocking
- **P3-Low**: Nice to have, can defer

## 7. Output

Save to `specs/tasks.md` and report:
- Total tasks count
- Tasks per phase
- Critical path summary
- Next step: `speckit_implement` to start coding
