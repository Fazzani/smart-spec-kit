# Plan Prompt

You are creating a technical implementation plan from a specification. Follow this structured approach:

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

## 4. Risk Assessment

Identify and mitigate:
- Technical risks
- Dependency risks
- Timeline risks

## 5. Quality Gates

Define checkpoints:
- Code review requirements
- Test coverage targets
- Performance benchmarks

## 6. Output

Save to `specs/plan.md` and report:
- Plan summary
- Total phases count
- Key risks identified
- Next step: `speckit_tasks` to generate task breakdown
