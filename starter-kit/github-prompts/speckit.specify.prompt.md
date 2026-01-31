---
description: "Create or update a feature specification from a natural language description"
mode: "agent"
tools: ["mcp_spec-kit_speckit_specify"]
---

# /speckit.specify

Create a complete, structured feature specification from a natural language description.

## User Input

```
$ARGUMENTS
```

You MUST consider the user input before proceeding (if not empty).

## Outline

Given the feature description, execute this workflow:

### 1. Generate Feature Short Name

- Extract meaningful keywords from the description
- Create a 2-4 word short name (action-noun format when possible)
- Examples:
  - "Add user authentication" → `user-auth`
  - "Create analytics dashboard" → `analytics-dashboard`
  - "Fix payment timeout bug" → `fix-payment-timeout`

### 2. Parse and Analyze Requirements

1. **Parse user description**: If empty, ERROR "No feature description provided"
2. **Extract key concepts**: Identify actors, actions, data, constraints
3. **Handle unclear aspects**:
   - Make informed guesses based on context and industry standards
   - Only mark with `[NEEDS CLARIFICATION: specific question]` if:
     - The choice significantly impacts feature scope or user experience
     - Multiple reasonable interpretations exist with different implications
     - No reasonable default exists
   - **LIMIT: Maximum 3 `[NEEDS CLARIFICATION]` markers total**
   - Prioritize clarifications by impact: scope > security/privacy > user experience > technical details

### 3. Fill Specification Template

Load `.spec-kit/templates/functional-spec.md` and fill each section:

1. **User Scenarios & Testing**: If no clear user flow, ERROR "Cannot determine user scenarios"
2. **Functional Requirements**: Each must be testable; use reasonable defaults (document in Assumptions)
3. **Success Criteria**: Measurable, technology-agnostic outcomes
4. **Key Entities**: If data involved, identify entities and relationships

### 4. Quality Validation

After writing the spec, validate against these criteria:

#### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

#### Requirement Completeness
- [ ] No `[NEEDS CLARIFICATION]` markers remain (or max 3 justified)
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable and technology-agnostic
- [ ] All acceptance scenarios defined
- [ ] Edge cases identified
- [ ] Scope clearly bounded

#### Feature Readiness
- [ ] All functional requirements have clear acceptance criteria
- [ ] User scenarios cover primary flows
- [ ] No implementation details leak into specification

### 5. Handle Clarifications

If `[NEEDS CLARIFICATION]` markers remain (max 3), present options to user:

```markdown
## Question [N]: [Topic]

**Context**: [Quote relevant spec section]

**What we need to know**: [Specific question]

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A      | [First answer] | [What this means] |
| B      | [Second answer] | [What this means] |
| C      | [Third answer] | [What this means] |
| Custom | Your own answer | [How to provide] |

**Recommended**: Option [X] - [reasoning why this is best]

Your choice: _[Wait for response]_
```

Present all questions together, then update spec with user's choices.

### 6. Write Specification

Save to `specs/[short-name]/spec.md` using the template structure.

### 7. Report Completion

Output:
- Feature name and spec file path
- Checklist results (pass/fail)
- Readiness for next phase
- Suggested next command: `/speckit.clarify` (if ambiguities) or `/speckit.plan`

## Quick Guidelines

- **Focus on WHAT** users need and **WHY**
- **Avoid HOW** to implement (no tech stack, APIs, code structure)
- Written for **business stakeholders**, not developers
- DO NOT create embedded checklists in the spec

### Success Criteria Guidelines

Success criteria MUST be:
1. **Measurable**: Include specific metrics (time, percentage, count)
2. **Technology-agnostic**: No frameworks, languages, databases
3. **User-focused**: Outcomes from user/business perspective
4. **Verifiable**: Can be tested without knowing implementation

**Good examples**:
- "Users can complete checkout in under 3 minutes"
- "System supports 10,000 concurrent users"
- "95% of searches return results in under 1 second"

**Bad examples** (implementation-focused):
- "API response time under 200ms" → use "Users see results instantly"
- "Database handles 1000 TPS" → use user-facing metric
- "React components render efficiently" → framework-specific

## Context

Load `.spec-kit/memory/constitution.md` for project principles.
Use `.spec-kit/templates/functional-spec.md` as template.
