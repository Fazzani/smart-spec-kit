# Specify Prompt

You are creating a functional specification document. Follow this structured approach:

## 1. Analyze Requirements

Determine the source of requirements:
- **Azure DevOps Work Item**: If input contains an ADO ID (e.g., "#12345", "AB#12345")
- **Direct Description**: If input is a feature description

For the provided requirements, identify:
1. **Core user need** and business value
2. **Explicit requirements** - what was directly stated
3. **Implicit requirements** - reasonable inferences from context
4. **Assumptions** - things that need validation
5. **Risks and dependencies**
6. **Edge cases and error scenarios**

## 2. Generate Specification

Fill the template with:

### Metadata
- Title, date, version, status
- Link to source (ADO work item if applicable)

### Overview
- **Purpose**: The problem being solved
- **Scope**: What's in/out
- **Background**: Context and motivation

### Requirements
- Functional requirements with IDs and priorities (Must Have/Should Have/Could Have)
- Non-functional requirements (performance, security, etc.)
- Acceptance criteria in **Given/When/Then** format

### User Experience
- User personas
- User stories (As a... I want... So that...)
- User flow descriptions

### Technical Considerations
- Dependencies
- Constraints
- Data requirements

## 3. Handle Ambiguity

**PREFERRED: Use the `askQuestions` tool** to ask structured clarifying questions BEFORE writing the spec. This is more effective than `[NEEDS CLARIFICATION]` markers.

When you encounter ambiguity:
1. **First**, try to make informed guesses based on context and industry standards
2. **If critical decisions remain**, use `askQuestions` to ask the user (max 3 questions)
3. **Batch questions** into a single `askQuestions` call when possible
4. **Mark your recommendation** on the best option

### askQuestions Usage

```json
{
  "questions": [{
    "header": "Scope",
    "question": "Should the notification system support real-time push notifications or only in-app notifications?",
    "options": [
      { "label": "Real-time push + in-app", "description": "WebSocket/SSE for instant delivery", "recommended": true },
      { "label": "In-app only", "description": "Polling-based, simpler architecture" },
      { "label": "Email + in-app", "description": "Async notifications via email" }
    ]
  }]
}
```

### Fallback: Markers

Only use `[NEEDS CLARIFICATION]` when `askQuestions` is not available:
- Maximum 3 markers for critical decisions only
- The choice significantly impacts feature scope
- Multiple reasonable interpretations exist
- No reasonable default exists

## 4. Quality Checks

Before saving, validate against this checklist:

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No unresolved `[NEEDS CLARIFICATION]` markers remain (max 3 allowed)
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Success criteria are technology-agnostic (no implementation details)
- [ ] All acceptance scenarios are defined
- [ ] Edge cases are identified
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

### Feature Readiness
- [ ] All functional requirements have clear acceptance criteria
- [ ] User scenarios cover primary flows
- [ ] Feature meets measurable outcomes defined in Success Criteria
- [ ] No implementation details leak into specification

**If validation fails**: Update the spec to address issues (max 3 iterations).

**If `[NEEDS CLARIFICATION]` markers remain** (max 3):
Present options to user in this format:

```markdown
## Question [N]: [Topic]

**Context**: [Quote relevant spec section]
**What we need to know**: [Specific question]

| Option | Answer | Implications |
|--------|--------|--------------|
| A | [First suggested answer] | [What this means] |
| B | [Second suggested answer] | [What this means] |
| Custom | Provide your own answer | [How to provide] |

**Your choice**: _[Wait for user response]_
```

## 5. Success Criteria Guidelines

Success criteria must be:
1. **Measurable**: Include specific metrics (time, percentage, count, rate)
2. **Technology-agnostic**: No mention of frameworks, languages, databases, or tools
3. **User-focused**: Describe outcomes from user/business perspective
4. **Verifiable**: Can be tested/validated without knowing implementation

✅ **Good examples**:
- "Users can complete checkout in under 3 minutes"
- "System supports 10,000 concurrent users"
- "95% of searches return results in under 1 second"

❌ **Bad examples** (implementation-focused):
- "API response time is under 200ms"
- "Database can handle 1000 TPS"
- "React components render efficiently"

## 6. Output

Save to `specs/{context_id}-spec.md` and report:
- Path to created specification
- Summary of requirements captured
- List of assumptions made
- Any `[NEEDS CLARIFICATION]` items (max 3)
- Validation checklist results
- Next step: `/speckit.clarify` (if clarifications needed) or `/speckit.plan`
