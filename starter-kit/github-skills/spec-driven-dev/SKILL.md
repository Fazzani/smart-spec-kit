# Spec-Driven Development Skill

This skill teaches the agent how to follow a specification-driven development workflow, producing high-quality specifications, plans, and implementations.

## Workflow

The spec-driven development workflow follows this sequence:

```
Requirements → Specification → Plan → Tasks → Implementation → Validation
```

Each step produces artifacts that feed into the next.

## Specification Writing

### Requirements Analysis

When analyzing requirements:
1. **Identify the core user need** and business value
2. **Extract explicit requirements** - what was directly stated
3. **Identify implicit requirements** - reasonable inferences from context
4. **Document assumptions** that need validation
5. **Note risks and dependencies**
6. **Consider edge cases** and error scenarios

### Specification Quality

A good specification:
- Is written for **all stakeholders** (developers, QA, product, business)
- Uses **active voice** and clear, concise language
- Contains **concrete examples** for complex requirements
- Has **requirement IDs** for traceability (FR-001, NFR-001)
- Includes **acceptance criteria** in Given/When/Then format
- Uses **priority indicators**: Must Have, Should Have, Could Have
- Has **measurable success criteria** (no vague terms like "fast" or "scalable")

### Success Criteria Rules

Success criteria MUST be:
1. **Measurable**: Include specific metrics (time, percentage, count)
2. **Technology-agnostic**: No mention of frameworks, languages, or databases
3. **User-focused**: Describe outcomes from user/business perspective
4. **Verifiable**: Can be tested without knowing implementation

✅ Good: "Users can complete checkout in under 3 minutes"
❌ Bad: "API response time is under 200ms" (implementation-focused)

## Planning

### Phase -1 Gates (MANDATORY)

Before ANY implementation planning, validate:

1. **Simplicity Gate**: ≤3 projects? No future-proofing?
2. **Anti-Abstraction Gate**: Using framework features directly?
3. **Integration-First Gate**: Contracts defined before implementation?
4. **Test-First Gate**: Tests from spec? Quickstart ready?

### Contracts First

Always define in this order:
1. Data Model (entities, relations, validation rules)
2. API Contracts (OpenAPI 3.0 endpoints)
3. Event Contracts (WebSocket/SSE, if real-time)
4. Main Plan (architecture, phases, decisions)

### Task Decomposition

Tasks should be:
- **Atomic**: One clear deliverable
- **Actionable**: Clear what to do
- **Testable**: Has acceptance criteria
- **Sized**: Completable in 1-4 hours
- **Traceable**: Links to requirement ID (e.g., `[US001]`)

Format: `- [ ] T### [P] [US#] Description with file path`

## Implementation

### Status Updates (MANDATORY)

After EACH task, update `tasks.md`:
- Change `- [ ]` to `- [x]`
- Add `✅ Done (YYYY-MM-DD)` at the end

### Memory Auto-Enrichment

After implementation, save learnings to `.spec-kit/memory/`:
- **Decisions** → `decisions.md`
- **Conventions** → `conventions.md`
- **Learnings** → `learnings.md`

### Commit Message Format

```
feat({scope}): {short description}

- {detail 1}
- {detail 2}

Task: {task ID}
```

## Validation

### Requirements Quality Checklists

Checklists are "unit tests for requirements writing" - they validate the quality of specs, NOT implementation.

✅ Correct: "Are error handling requirements defined for all API failure modes?"
❌ Wrong: "Verify the button clicks correctly"

### Security Validation

Check against `.spec-kit/rules/security-rules.md`:
- Authentication & Authorization
- Data Protection (at rest, in transit)
- API Security (input validation, rate limiting)
- Infrastructure (secrets, logging)
- OWASP Top 10

### RGPD/GDPR Validation

Check against `.spec-kit/rules/rgpd-rules.md`:
- Personal data inventory and classification
- Legal basis for processing
- Data subject rights implementation
- Data minimization and retention
- Third-party processor agreements

## Project Context

Always load these files when available:
- `.spec-kit/memory/constitution.md` - Project principles (non-negotiable)
- `.spec-kit/memory/decisions.md` - Past decisions
- `.spec-kit/memory/conventions.md` - Coding conventions
