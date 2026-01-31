---
description: "Identify and resolve ambiguities in a feature specification through targeted questions"
mode: "agent"
tools: ["mcp_spec-kit_speckit_clarify"]
---

# /speckit.clarify

Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions and encoding answers back into the spec.

## User Input

```
$ARGUMENTS
```

You MUST consider the user input before proceeding (if not empty).

## Goal

Detect and reduce ambiguity or missing decision points in the active feature specification and record the clarifications directly in the spec file.

**Note**: This workflow should run BEFORE `/speckit.plan`. If user explicitly skips clarification (e.g., exploratory spike), warn that downstream rework risk increases.

## Execution Steps

### 1. Load Specification

- Find the most recent spec in `specs/` directory
- If path provided in arguments, use that instead
- If spec missing, instruct user to run `/speckit.specify` first

### 2. Ambiguity & Coverage Scan

Perform a structured scan using this **13-category taxonomy**. Mark each as: **Clear** / **Partial** / **Missing**

#### Functional Scope & Behavior
- Core user goals & success criteria
- Explicit out-of-scope declarations
- User roles/personas differentiation

#### Domain & Data Model
- Entities, attributes, relationships
- Identity & uniqueness rules
- Lifecycle/state transitions
- Data volume/scale assumptions

#### Interaction & UX Flow
- Critical user journeys/sequences
- Error/empty/loading states
- Accessibility or localization notes

#### Non-Functional Quality Attributes
- Performance (latency, throughput targets)
- Scalability (horizontal/vertical, limits)
- Reliability & availability (uptime, recovery)
- Observability (logging, metrics, tracing)
- Security & privacy (authN/Z, data protection)
- Compliance/regulatory constraints

#### Integration & External Dependencies
- External services/APIs and failure modes
- Data import/export formats
- Protocol/versioning assumptions

#### Edge Cases & Failure Handling
- Negative scenarios
- Rate limiting/throttling
- Conflict resolution (concurrent edits)

#### Constraints & Tradeoffs
- Technical constraints (language, storage, hosting)
- Explicit tradeoffs or rejected alternatives

#### Terminology & Consistency
- Canonical glossary terms
- Avoided synonyms/deprecated terms

#### Completion Signals
- Acceptance criteria testability
- Measurable Definition of Done indicators

#### Misc / Placeholders
- TODO markers/unresolved decisions
- Ambiguous adjectives ("robust", "intuitive") lacking quantification

### 3. Generate Prioritized Questions

Create a queue of max **5 questions**. Apply these constraints:

- Maximum 10 total questions across the whole session
- Each question must be answerable with:
  - Multiple-choice (2-5 options), OR
  - Short answer (≤5 words)
- Only include questions that materially impact: architecture, data modeling, task decomposition, test design, UX behavior, operational readiness, or compliance
- Ensure category coverage balance: prioritize highest-impact unresolved categories
- Exclude questions already answered or trivial preferences
- Favor clarifications that reduce downstream rework risk

### 4. Sequential Questioning Loop

Present **ONE question at a time**:

#### For Multiple-Choice Questions:

```markdown
## Question [N]: [Topic]

**Context**: [Quote relevant spec section]

**What we need to know**: [Specific question]

| Option | Answer | Implications |
|--------|--------|--------------|
| A | [First answer] | [What this means] |
| B | [Second answer] | [What this means] |
| C | [Third answer] | [What this means] |
| Short | Provide your own (≤5 words) | [If applicable] |

**Recommended**: Option [X] - [reasoning]

Reply with option letter (e.g., "A"), "yes"/"recommended" to accept suggestion, or your own short answer.
```

#### For Short-Answer Questions:

```markdown
## Question [N]: [Topic]

**Context**: [Quote relevant spec section]

**Suggested**: [Your proposed answer] - [brief reasoning]

Format: Short answer (≤5 words). Say "yes" to accept or provide your own.
```

#### After Each Answer:

1. Validate answer maps to an option or fits ≤5 word constraint
2. If ambiguous, ask for quick disambiguation (same question, doesn't count as new)
3. Record in working memory
4. Move to next question

#### Stop Conditions:

- All critical ambiguities resolved
- User signals completion ("done", "good", "no more")
- Reached 5 asked questions

### 5. Integrate Clarifications

After EACH accepted answer, update the spec:

1. Ensure `## Clarifications` section exists (create after overview if missing)
2. Add `### Session YYYY-MM-DD` subheading for today
3. Append: `- Q: <question> → A: <final answer>`
4. Apply clarification to appropriate section:
   - Functional ambiguity → Update Functional Requirements
   - User interaction → Update User Stories or Actors
   - Data shape → Update Data Model
   - Non-functional → Add measurable criteria to Quality Attributes
   - Edge case → Add to Edge Cases / Error Handling
   - Terminology → Normalize across spec
5. If clarification invalidates earlier statement, REPLACE it (no contradictions)
6. Save spec after each integration

### 6. Validation

After each write:
- Clarifications section has exactly one bullet per answer
- Total asked questions ≤ 5
- No lingering placeholders the answer resolved
- No contradictory statements remain
- Markdown structure valid
- Terminology consistent

### 7. Report Completion

Output:
- Number of questions asked & answered
- Path to updated spec
- Sections touched (list names)
- Coverage summary table:

| Category | Status |
|----------|--------|
| Functional Scope | ✅ Clear |
| Data Model | ⚠️ Deferred |
| Non-Functional | ✅ Resolved |
| Edge Cases | ⚠️ Outstanding |

- Suggested next command: `/speckit.plan` or `/speckit.clarify` again

## Behavior Rules

- If no meaningful ambiguities found: "No critical ambiguities detected." → suggest proceeding
- Never exceed 5 total asked questions
- Avoid speculative tech stack questions unless blocking functional clarity
- Respect user early termination signals ("stop", "done", "proceed")
