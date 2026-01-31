# Plan Prompt

You are creating a technical implementation plan from a specification. Follow this structured approach:

## 0. Phase -1: Pre-Implementation Gates (MANDATORY)

**⚠️ STOP**: Before ANY implementation planning, validate these gates:

### Simplicity Gate (Article VII)
- [ ] Using ≤3 projects for initial implementation?
- [ ] No future-proofing or speculative features?
- [ ] No "might need later" abstractions?

### Anti-Abstraction Gate (Article VIII)
- [ ] Using framework features directly (no unnecessary wrappers)?
- [ ] Single model representation per entity?
- [ ] No custom abstractions over standard libraries?

### Integration-First Gate (Article IX)
- [ ] API contracts defined before implementation?
- [ ] Contract tests planned?
- [ ] Using real dependencies (not mocks) where possible?

### Test-First Gate (Article III)
- [ ] Acceptance tests derived from spec user stories?
- [ ] Test scenarios defined before code?
- [ ] Quickstart validation scenarios ready?

**All gates must pass. Document justified exceptions in Complexity Tracking section.**

---

## 1. Understand the Specification

Read and analyze:
- All functional requirements
- Non-functional requirements
- Technical constraints
- Dependencies

## 2. Architecture Analysis

Identify:
- **Components to create or modify**
- **Integration points**
- **Data flows**
- **API contracts** (if applicable)

## 3. Create Implementation Plan

Structure the plan with:

### Phases
Break work into logical phases:
1. **Foundation** - Core infrastructure, models, utilities
2. **Core Features** - Main functionality
3. **Integration** - Connecting components
4. **Polish** - Error handling, edge cases, UX
5. **Testing** - Unit, integration, E2E tests

### For Each Phase

Define:
- **Objectives**: What this phase accomplishes
- **Deliverables**: Concrete outputs
- **Dependencies**: What must be done first
- **Risks**: Potential blockers
- **Estimated effort**: T-shirt size (S/M/L/XL)

### Technical Decisions

Document key decisions:
- Patterns to use
- Libraries to adopt
- Trade-offs made

## 4. Generate Supporting Documents

After the main plan, generate these supporting documents:

### 4.1 Data Model (`data-model.md`)
- Define all entities from the spec
- Document fields, types, constraints
- Define relations (1:N, N:N)
- Add validation rules
- Include sample data

**Template**: `.spec-kit/templates/data-model.md`

### 4.2 API Contracts (`contracts/api.yaml`)
- OpenAPI 3.0 specification
- All CRUD endpoints for entities
- Request/response schemas
- Error responses
- Authentication requirements

**Template**: `.spec-kit/templates/contracts/api-template.yaml`

### 4.3 Events Contract (`contracts/events.md`) - If Real-Time
- WebSocket/SSE events
- Client → Server events
- Server → Client events
- Error events
- Reconnection strategy

**Template**: `.spec-kit/templates/contracts/events-template.md`

### 4.4 Quickstart Validation (`quickstart.md`)
- Manual test scenarios from user stories
- Prerequisites and test accounts
- Step-by-step validation instructions
- Expected results
- Troubleshooting guide

**Template**: `.spec-kit/templates/quickstart.md`

### 4.5 Technical Research (`research.md`) - Optional
Only if significant technical decisions needed:
- Options comparison matrix
- Pros/cons analysis
- Proof of concept results
- Decision rationale

**Template**: `.spec-kit/templates/research.md`

## 5. Risk Assessment

Identify and mitigate:
- Technical risks
- Dependency risks
- Timeline risks

## 6. Quality Gates

Define checkpoints:
- Code review requirements
- Test coverage targets
- Performance benchmarks

## 7. Output

Save all documents to `specs/[branch-name]/`:
```
specs/[branch-name]/
├── spec.md           # Already exists
├── plan.md           # Main plan
├── data-model.md     # Entity definitions
├── quickstart.md     # Validation scenarios
├── research.md       # Technical research (optional)
└── contracts/
    ├── api.yaml      # REST API spec
    └── events.md     # Real-time events (optional)
```

Report:
- Plan summary
- Total phases count
- Supporting docs generated
- Key risks identified
- Next step: `speckit_tasks` to generate task breakdown
