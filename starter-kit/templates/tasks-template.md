# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[feature]/`
**Generated**: [DATE]
**Total Tasks**: [COUNT]

---

## Task Format

```text
- [ ] T### [P?] [Story?] Description - `path/to/file.ext`
```

**Legend**:

- `T###`: Task ID (sequential)
- `[P]`: Can be executed in parallel with other `[P]` tasks in same phase
- `[Story?]`: Associated user story ID (optional)
- File path in backticks shows primary file(s) affected

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure
**Duration**: [X days]

- [ ] T001 Initialize project with package manager - `package.json`
- [ ] T002 Configure TypeScript/linting - `tsconfig.json`, `.eslintrc`
- [ ] T003 [P] Set up testing framework - `jest.config.js`
- [ ] T004 [P] Create project directory structure - `src/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story
**Duration**: [X days]

⚠️ **CRITICAL**: No user story work begins until this phase is complete.

- [ ] T005 Create database schema - `src/db/schema.sql`
- [ ] T006 [P] Set up database migrations - `src/db/migrations/`
- [ ] T007 [P] Implement base entity models - `src/models/`
- [ ] T008 Create error handling utilities - `src/utils/errors.ts`
- [ ] T009 Set up logging infrastructure - `src/utils/logger.ts`

**Checkpoint**: Foundation ready - run `npm run test:setup` to verify

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [User story goal from spec]
**Independent Test**: [How to verify this story works alone]
**Duration**: [X days]

- [ ] T010 [US-1] Create [entity] model - `src/models/entity.ts`
- [ ] T011 [P] [US-1] Create [entity] repository - `src/repositories/entity.ts`
- [ ] T012 [P] [US-1] Create [entity] service - `src/services/entity.ts`
- [ ] T013 [US-1] Create [endpoint] API route - `src/api/routes/entity.ts`
- [ ] T014 [US-1] Add unit tests for service - `tests/unit/entity.test.ts`
- [ ] T015 [US-1] Add integration tests - `tests/integration/entity.test.ts`

**Checkpoint**: Story 1 complete - run `npm test && npm run test:integration`

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [User story goal from spec]
**Independent Test**: [How to verify this story works alone]
**Duration**: [X days]

- [ ] T020 [US-2] [Description] - `path/to/file`
- [ ] T021 [P] [US-2] [Description] - `path/to/file`
- [ ] T022 [US-2] [Description] - `path/to/file`

**Checkpoint**: Story 2 complete - [verification command]

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [User story goal from spec]
**Duration**: [X days]

- [ ] T030 [US-3] [Description] - `path/to/file`

**Checkpoint**: Story 3 complete - [verification command]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final quality improvements
**Duration**: [X days]

- [ ] T090 Code cleanup and refactoring
- [ ] T091 [P] Update documentation - `README.md`
- [ ] T092 [P] Add inline code comments
- [ ] T093 Performance profiling and optimization
- [ ] T094 Security review and hardening
- [ ] T095 Final integration test pass

---

## Dependencies & Execution Order

```text
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundation)
    │
    ├──────────────┬──────────────┐
    ▼              ▼              ▼
Phase 3 (US-1)  Phase 4 (US-2)  Phase 5 (US-3)  ← Can run in parallel
    │              │              │
    └──────────────┴──────────────┘
                   │
                   ▼
            Phase N (Polish)
```

---

## Parallel Execution Example

Tasks marked `[P]` within the same phase can run simultaneously:

```text
Phase 3, Story 1:
├── T010 Create model (sequential - others depend on this)
│
├── T011 [P] Create repository  ─┐
├── T012 [P] Create service     ─┼── Run in parallel
└── T013 Create API route (waits for T011, T012)
```

---

## Task Statistics

| Phase | Tasks | Parallel | Duration |
|-------|-------|----------|----------|
| Setup | 4 | 2 | [X days] |
| Foundation | 5 | 3 | [X days] |
| Story 1 | 6 | 2 | [X days] |
| Story 2 | 3 | 1 | [X days] |
| Story 3 | 1 | 0 | [X days] |
| Polish | 6 | 3 | [X days] |
| **Total** | **25** | **11** | **[X days]** |
