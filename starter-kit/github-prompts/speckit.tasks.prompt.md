---
description: "Generate an actionable, dependency-ordered task list from the implementation plan"
mode: "agent"
tools: ["mcp_spec-kit_speckit_tasks"]
---

# /speckit.tasks

Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.

## User Input

```
$ARGUMENTS
```

You MUST consider the user input before proceeding (if not empty).

## Execution Steps

### 1. Load Design Documents

Read from feature directory:
- **Required**: `plan.md` (tech stack, libraries, structure), `spec.md` (user stories with priorities)
- **Optional**: `data-model.md` (entities), `contracts/` (API endpoints), `research.md` (decisions)

Note: Not all projects have all documents. Generate tasks based on what's available.

### 2. Extract Information

From each document:
- `plan.md`: Tech stack, libraries, project structure, phases
- `spec.md`: User stories with priorities (P1, P2, P3)
- `data-model.md`: Entities and relationships (if exists)
- `contracts/`: API endpoints mapped to user stories (if exists)
- `research.md`: Technical decisions and constraints (if exists)

### 3. Generate Tasks

Create `specs/[feature]/tasks.md` with tasks organized by user story.

---

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the spec or if user requests TDD approach.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```
- [ ] T### [P] [US#] Description with file path
```

#### Format Components:

| Component | Description | Required |
|-----------|-------------|----------|
| `- [ ]` | Markdown checkbox | Always |
| `T###` | Task ID (T001, T002...) in execution order | Always |
| `[P]` | Parallel marker - task can run independently | Only if parallelizable |
| `[US#]` | User Story label (US1, US2...) | Only in User Story phases |
| Description | Clear action with exact file path | Always |

### Examples:

✅ **CORRECT**:
```markdown
- [ ] T001 Create project structure per implementation plan
- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py
- [ ] T012 [P] [US1] Create User model in src/models/user.py
- [ ] T014 [US1] Implement UserService in src/services/user_service.py
- [ ] T020 [US2] Add payment endpoint in src/api/payments.py
```

❌ **WRONG**:
```markdown
- [ ] Create User model                    # Missing ID and file path
T001 [US1] Create model                    # Missing checkbox
- [ ] [US1] Create User model              # Missing Task ID
- [ ] T001 [US1] Create model              # Missing file path
```

---

## Phase Structure

### Phase 1: Setup
Project initialization - NO story label

```markdown
## Phase 1: Setup

- [ ] T001 Create project structure per implementation plan
- [ ] T002 [P] Configure build tools in package.json
- [ ] T003 [P] Set up testing framework in jest.config.js
- [ ] T004 Create .gitignore with standard patterns
```

### Phase 2: Foundational
Blocking prerequisites - NO story label

```markdown
## Phase 2: Foundational

- [ ] T005 [P] Create database schema in src/db/schema.sql
- [ ] T006 [P] Implement base service class in src/services/base.py
- [ ] T007 Configure authentication in src/config/auth.py
```

### Phase 3+: User Stories (Priority Order)
One phase per user story from spec.md (P1, P2, P3...)

```markdown
## Phase 3: User Story 1 - User Registration [P1]

**Goal**: Users can create accounts and log in
**Test Criteria**: User can register, receive confirmation, and access dashboard

- [ ] T010 [P] [US1] Create User model in src/models/user.py
- [ ] T011 [P] [US1] Create UserRepository in src/repositories/user_repo.py
- [ ] T012 [US1] Implement UserService in src/services/user_service.py
- [ ] T013 [US1] Add registration endpoint in src/api/auth.py
- [ ] T014 [US1] Add login endpoint in src/api/auth.py

## Phase 4: User Story 2 - Payment Processing [P2]

**Goal**: Users can make payments securely
**Test Criteria**: User can add payment method and complete purchase

- [ ] T020 [P] [US2] Create Payment model in src/models/payment.py
- [ ] T021 [US2] Implement PaymentService in src/services/payment_service.py
- [ ] T022 [US2] Add payment endpoint in src/api/payments.py
```

### Final Phase: Polish & Cross-Cutting
NO story label

```markdown
## Phase N: Polish & Cross-Cutting

- [ ] T050 [P] Add error handling middleware in src/middleware/errors.py
- [ ] T051 [P] Implement logging in src/utils/logger.py
- [ ] T052 Update API documentation in docs/api.md
- [ ] T053 Performance optimization review
```

---

## Task Organization Rules

### From User Stories (PRIMARY)
- Each user story (P1, P2, P3) gets its own phase
- Map all related components to their story:
  - Models needed for that story
  - Services needed for that story
  - Endpoints/UI needed for that story
  - Tests specific to that story (if requested)
- Mark story dependencies (most stories should be independent)

### From Data Model
- Map each entity to user story(ies) that need it
- If entity serves multiple stories: Put in earliest story or Foundational phase
- Relationships → service layer tasks in appropriate phase

### Parallelization Rules
- Mark `[P]` only if task:
  - Affects different files than concurrent tasks
  - Has no dependencies on incomplete tasks
  - Can be verified independently

---

## Dependencies Section

Include at end of tasks.md:

```markdown
## Dependencies

### Story Completion Order
1. US1 (User Registration) - No dependencies
2. US2 (Payment Processing) - Requires US1 complete
3. US3 (Order History) - Requires US2 complete

### Parallel Execution Groups

**Phase 1 (all parallel)**:
- T002, T003 can run simultaneously

**Phase 3 (US1)**:
- T010, T011 can run in parallel
- T012 requires T010, T011 complete
- T013, T014 require T012 complete
```

---

## Report

Output:
- Path to generated `tasks.md`
- Summary:
  - Total task count
  - Task count per user story
  - Parallel opportunities identified
  - Independent test criteria for each story
  - Suggested MVP scope (typically User Story 1)
- Format validation: Confirm ALL tasks follow checklist format
- Suggested next command: `/speckit.implement`

---

## Context

Use `.spec-kit/templates/tasks-template.md` as structural guide.
The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.
