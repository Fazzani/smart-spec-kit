# Implementation Plan: [FEATURE NAME]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link to spec.md]

---

## Phase -1: Pre-Implementation Gates

> **⚠️ STOP**: Do not proceed to implementation until ALL gates pass.
> These gates enforce architectural discipline from the Constitution.

### Simplicity Gate (Article VII)

| Check | Status | Notes |
|-------|--------|-------|
| Using ≤3 projects for initial implementation? | ⬜ | Max 3 projects without documented justification |
| No future-proofing or speculative features? | ⬜ | Only implement what's specified |
| No "might need later" abstractions? | ⬜ | YAGNI principle |

### Anti-Abstraction Gate (Article VIII)

| Check | Status | Notes |
|-------|--------|-------|
| Using framework features directly? | ⬜ | No unnecessary wrappers |
| Single model representation per entity? | ⬜ | Avoid duplicate DTOs/models |
| No custom abstractions over standard libraries? | ⬜ | Trust the framework |

### Integration-First Gate (Article IX)

| Check | Status | Notes |
|-------|--------|-------|
| API contracts defined before implementation? | ⬜ | See `contracts/` folder |
| Contract tests written? | ⬜ | Tests verify contract compliance |
| Using real dependencies (not mocks) where possible? | ⬜ | Prefer real DB, services |

### Test-First Gate (Article III)

| Check | Status | Notes |
|-------|--------|-------|
| Acceptance tests derived from spec? | ⬜ | Map to user stories |
| Test scenarios defined before code? | ⬜ | Red-Green-Refactor |
| Quickstart validation scenarios ready? | ⬜ | See `quickstart.md` |

### Gate Summary

| Gate | Status | Blocker? |
|------|--------|----------|
| Simplicity (VII) | ⬜ PENDING | Yes |
| Anti-Abstraction (VIII) | ⬜ PENDING | Yes |
| Integration-First (IX) | ⬜ PENDING | Yes |
| Test-First (III) | ⬜ PENDING | Yes |

**All gates must pass before proceeding. Document any justified exceptions in Complexity Tracking section.**

---

## Summary

[TO FILL: Brief description of the implementation approach]

## Technical Context

### Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Language | [TO FILL] | |
| Framework | [TO FILL] | |
| Database | [TO FILL] | |
| Testing | [TO FILL] | |

### Architecture Overview

```text
[TO FILL: ASCII diagram or description of architecture]

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│     API     │───▶│  Database   │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## Project Structure

```text
[TO FILL: Project directory structure]

src/
├── models/
├── services/
├── api/
└── utils/

tests/
├── unit/
├── integration/
└── e2e/
```

---

## Implementation Phases

### Phase 0: Research & Design

**Duration**: [X days]
**Output**: research.md, data-model.md

- [ ] Validate tech stack choices
- [ ] Research key libraries/patterns
- [ ] Design data model
- [ ] Define API contracts

### Phase 1: Foundation

**Duration**: [X days]
**Dependencies**: Phase 0

- [ ] Set up project structure
- [ ] Configure build/test pipeline
- [ ] Create base models
- [ ] Set up database schema

### Phase 2: Core Implementation

**Duration**: [X days]
**Dependencies**: Phase 1

- [ ] Implement core services
- [ ] Create API endpoints
- [ ] Add unit tests

### Phase 3: Integration & Polish

**Duration**: [X days]
**Dependencies**: Phase 2

- [ ] Integration testing
- [ ] Error handling improvements
- [ ] Documentation
- [ ] Performance optimization

---

## Quality Gates

| Gate | Criteria | Status |
|------|----------|--------|
| Code Review | All PRs reviewed | ⬜ |
| Unit Tests | >80% coverage | ⬜ |
| Integration Tests | All scenarios pass | ⬜ |
| Documentation | README updated | ⬜ |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [TO FILL] | Medium | High | [TO FILL] |

---

## Technical Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| [TO FILL] | [TO FILL] | [TO FILL] | [TO FILL] |

---

## Dependencies

| Dependency | Version | Purpose | Notes |
|------------|---------|---------|-------|
| [TO FILL] | | | |

---

## Notes

[TO FILL: Additional implementation notes, gotchas, or considerations]

---

## Complexity Tracking

> Document any justified deviations from Constitution articles here.

| Gate Deviation | Article | Justification | Approved By |
|----------------|---------|---------------|-------------|
| [Example: Using 4 projects] | VII | [Explain why ≤3 was impossible] | [Reviewer] |

---

## Supporting Documents Checklist

| Document | Required | Status | Location |
|----------|----------|--------|----------|
| `data-model.md` | ✅ Yes | ⬜ | `specs/[branch]/data-model.md` |
| `contracts/` | ✅ Yes | ⬜ | `specs/[branch]/contracts/` |
| `quickstart.md` | ✅ Yes | ⬜ | `specs/[branch]/quickstart.md` |
| `research.md` | Optional | ⬜ | `specs/[branch]/research.md` |
