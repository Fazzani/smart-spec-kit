# Tasks Prompt

You are generating a detailed task breakdown from an implementation plan and supporting documents.

## 0. Input Sources

Read ALL available documents in the feature folder:

| Document | Required | What to Extract |
|----------|----------|-----------------|
| `plan.md` | ✅ Yes | Phases, architecture, decisions |
| `data-model.md` | ✅ Yes | Entity CRUD tasks, migrations |
| `contracts/api.yaml` | ✅ Yes | Endpoint implementation tasks |
| `contracts/events.md` | If exists | Event handler tasks |
| `quickstart.md` | ✅ Yes | Validation test tasks |
| `research.md` | If exists | Setup/integration tasks |

## 1. Understand the Plan

Read and analyze:
- All phases and their objectives
- Deliverables per phase
- Dependencies between phases
- Technical decisions made

## 2. Task Derivation Strategy

### From `data-model.md`:
- **Entity tasks**: Create model, migrations, validations
- **Relation tasks**: Junction tables, foreign keys
- **Index tasks**: Performance optimization

### From `contracts/api.yaml`:
- **Endpoint tasks**: One task per endpoint (GET, POST, PUT, DELETE)
- **Validation tasks**: Request schema validation
- **Error handling tasks**: Error responses

### From `contracts/events.md`:
- **Event handler tasks**: Client → Server events
- **Broadcasting tasks**: Server → Client events
- **Room/channel tasks**: Subscription management

### From `quickstart.md`:
- **Test tasks**: Convert scenarios to automated tests
- **Seed tasks**: Test data setup

## 3. Task Format (MANDATORY)

Use this EXACT format for each task:

```
- [ ] T### [P] [US#] Description with file path
```

Where:
- `T###` = Task number (T001, T002...)
- `[P]` = Parallel marker (add if task can run in parallel)
- `[US#]` = User Story reference from spec (US001, US002...)

**Examples**:
```markdown
- [ ] T001 [US001] Create User entity model `src/models/user.ts`
- [ ] T002 [P] [US001] Create User migration `migrations/001_users.sql`
- [ ] T003 [US002] Implement POST /users endpoint `src/api/users.ts`
```

## 4. Task Decomposition Principles

Create tasks that are:
- **Atomic**: One clear deliverable
- **Actionable**: Clear what to do
- **Testable**: Has acceptance criteria
- **Sized**: Completable in 1-4 hours

## 5. Task Phases

Organize tasks in this order:

### Phase 0: Setup
```markdown
## Phase 0: Setup
- [ ] T001 [P] Initialize project structure
- [ ] T002 [P] Configure database connection
- [ ] T003 [P] Set up test framework
```

### Phase 1: Foundational (from data-model.md)
```markdown
## Phase 1: Data Layer
- [ ] T010 [US001] Create Entity1 model `src/models/entity1.ts`
- [ ] T011 [P] Create Entity1 migration `migrations/001_entity1.sql`
- [ ] T012 [US002] Create Entity2 model with FK to Entity1
```

### Phase 2: API Layer (from contracts/api.yaml)
```markdown
## Phase 2: API Implementation
- [ ] T020 [US001] GET /resources - List all `src/api/resources.ts`
- [ ] T021 [US001] POST /resources - Create new
- [ ] T022 [US002] GET /resources/:id - Get by ID
```

### Phase 3: Events (from contracts/events.md) - If applicable
```markdown
## Phase 3: Real-Time Events
- [ ] T030 [US003] Handle event.send from client
- [ ] T031 [US003] Broadcast event.created to room
```

### Phase 4: Testing (from quickstart.md)
```markdown
## Phase 4: Testing
- [ ] T040 [US001] Test: Scenario 1 - Happy path
- [ ] T041 [US002] Test: Scenario 2 - Edge case
```

### Phase 5: Polish
```markdown
## Phase 5: Polish & Documentation
- [ ] T050 [P] Add error handling middleware
- [ ] T051 [P] Update API documentation
```

## 6. Dependencies Section

After tasks, add dependencies:

```markdown
## Dependencies

| Task | Depends On | Reason |
|------|------------|--------|
| T020 | T010 | API needs model |
| T030 | T020 | Events need API |
| T040 | T020, T030 | Tests need implementation |

## Parallel Groups

These tasks can run in parallel:
- **Group A**: T001, T002, T003 (Setup)
- **Group B**: T010, T011 (Data layer)
```

## 7. Output

Save to `specs/[branch]/tasks.md` and report:
- Total tasks count
- Tasks per phase breakdown
- Parallel task groups
- Critical path (longest dependency chain)
- Next step: `speckit_implement` to start coding
