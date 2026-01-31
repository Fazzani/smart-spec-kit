---
description: "Generate custom quality checklists for requirements validation - Unit Tests for English"
mode: "agent"
tools: ["mcp_spec-kit_speckit_validate"]
---

# /speckit.checklist

Generate a custom checklist that validates requirements completeness, clarity, and consistency.

## User Input

```
$ARGUMENTS
```

You MUST consider the user input before proceeding (if not empty).

---

## CRITICAL CONCEPT: "Unit Tests for English"

Checklists are **UNIT TESTS FOR REQUIREMENTS WRITING** - they validate the quality, clarity, and completeness of requirements in a given domain.

### NOT for verification/testing:
- ❌ NOT "Verify the button clicks correctly"
- ❌ NOT "Test error handling works"
- ❌ NOT "Confirm the API returns 200"
- ❌ NOT checking if code/implementation matches the spec

### FOR requirements quality validation:
- ✅ "Are visual hierarchy requirements defined for all card types?" (completeness)
- ✅ "Is 'prominent display' quantified with specific sizing/positioning?" (clarity)
- ✅ "Are hover state requirements consistent across all interactive elements?" (consistency)
- ✅ "Are accessibility requirements defined for keyboard navigation?" (coverage)
- ✅ "Does the spec define what happens when logo image fails to load?" (edge cases)

**Metaphor**: If your spec is code written in English, the checklist is its unit test suite. You're testing whether the requirements are well-written, complete, unambiguous, and ready for implementation - NOT whether the implementation works.

---

## Execution Steps

### 1. Load Feature Context

Read from feature directory:
- `spec.md`: Feature requirements and scope
- `plan.md` (if exists): Technical details, dependencies
- `tasks.md` (if exists): Implementation tasks

### 2. Clarify Intent (Dynamic)

Derive up to **3 contextual clarifying questions** from user input + spec signals:
- Only ask about information that materially changes checklist content
- Skip if already unambiguous in arguments

Question types:
- **Scope refinement**: "Should this include integration touchpoints with X?"
- **Risk prioritization**: "Which risk areas should receive mandatory gating checks?"
- **Depth calibration**: "Lightweight pre-commit or formal release gate?"
- **Audience framing**: "For author self-review or peer PR review?"

### 3. Generate Checklist

Create `specs/checklists/[domain].md` with items testing **requirements quality**.

#### Item Format

```markdown
- [ ] CHK001 - [Question about requirement quality] [Quality Dimension, Spec §X.Y]
```

Components:
- **CHK###**: Sequential ID starting from CHK001
- **Question**: About requirement quality (NOT implementation)
- **Quality Dimension**: `[Completeness]`, `[Clarity]`, `[Consistency]`, `[Measurability]`, `[Coverage]`, `[Gap]`, `[Ambiguity]`, `[Conflict]`
- **Spec Reference**: `[Spec §X.Y]` or `[Gap]` if missing

#### Quality Dimensions

| Dimension | What It Tests |
|-----------|---------------|
| **Completeness** | Are all necessary requirements present? |
| **Clarity** | Are requirements unambiguous and specific? |
| **Consistency** | Do requirements align without conflicts? |
| **Measurability** | Can requirements be objectively verified? |
| **Coverage** | Are all scenarios/edge cases addressed? |
| **Gap** | Is a requirement missing entirely? |
| **Ambiguity** | Is something vague that needs quantification? |
| **Conflict** | Do two requirements contradict each other? |

#### Category Structure

Group items by requirement quality dimensions:

```markdown
## Requirement Completeness
- [ ] CHK001 - Are error handling requirements defined for all API failure modes? [Gap]
- [ ] CHK002 - Are accessibility requirements specified for all interactive elements? [Completeness]

## Requirement Clarity
- [ ] CHK003 - Is 'fast loading' quantified with specific timing thresholds? [Clarity, Spec §NFR-2]
- [ ] CHK004 - Is 'prominent' defined with measurable visual properties? [Ambiguity, Spec §FR-4]

## Requirement Consistency
- [ ] CHK005 - Do navigation requirements align across all pages? [Consistency, Spec §FR-10]

## Scenario Coverage
- [ ] CHK006 - Are requirements defined for zero-state scenarios (no data)? [Coverage, Edge Case]
- [ ] CHK007 - Are concurrent user interaction scenarios addressed? [Coverage, Gap]

## Non-Functional Requirements
- [ ] CHK008 - Are performance requirements quantified with specific metrics? [Clarity]
- [ ] CHK009 - Are security failure/breach response requirements defined? [Gap]
```

---

## How To Write Checklist Items

### ❌ WRONG (Testing implementation):
- "Verify landing page displays 3 episode cards"
- "Test hover states work correctly on desktop"
- "Confirm logo click navigates to home page"
- "Check that related episodes section shows 3-5 items"

### ✅ CORRECT (Testing requirements quality):
- "Are the number and layout of featured episodes explicitly specified?" [Completeness, Spec §FR-001]
- "Are hover state requirements consistently defined for all interactive elements?" [Consistency, Spec §FR-003]
- "Are navigation requirements clear for all clickable brand elements?" [Clarity, Spec §FR-010]
- "Is the selection criteria for related episodes documented?" [Gap, Spec §FR-005]
- "Are loading state requirements defined for asynchronous data?" [Gap]
- "Can 'visual hierarchy' requirements be objectively measured?" [Measurability, Spec §FR-001]

### Key Differences:
| Wrong | Correct |
|-------|---------|
| Tests if the system works | Tests if requirements are written correctly |
| Verification of behavior | Validation of requirement quality |
| "Does it do X?" | "Is X clearly specified?" |

---

## 🚫 ABSOLUTELY PROHIBITED

These make it an implementation test, not a requirements test:

- ❌ Any item starting with "Verify", "Test", "Confirm", "Check" + implementation behavior
- ❌ References to code execution, user actions, system behavior
- ❌ "Displays correctly", "works properly", "functions as expected"
- ❌ "Click", "navigate", "render", "load", "execute"
- ❌ Test cases, test plans, QA procedures
- ❌ Implementation details (frameworks, APIs, algorithms)

## ✅ REQUIRED PATTERNS

These test requirements quality:

- ✅ "Are [requirement type] defined/specified/documented for [scenario]?"
- ✅ "Is [vague term] quantified/clarified with specific criteria?"
- ✅ "Are requirements consistent between [section A] and [section B]?"
- ✅ "Can [requirement] be objectively measured/verified?"
- ✅ "Are [edge cases/scenarios] addressed in requirements?"
- ✅ "Does the spec define [missing aspect]?"

---

## Checklist Types & Examples

### UX Requirements Quality: `ux.md`
- "Are visual hierarchy requirements defined with measurable criteria?" [Clarity]
- "Is the number and positioning of UI elements explicitly specified?" [Completeness]
- "Are interaction state requirements (hover, focus, active) consistently defined?" [Consistency]
- "Is fallback behavior defined when images fail to load?" [Edge Case, Gap]

### API Requirements Quality: `api.md`
- "Are error response formats specified for all failure scenarios?" [Completeness]
- "Are rate limiting requirements quantified with specific thresholds?" [Clarity]
- "Are retry/timeout requirements defined for external dependencies?" [Coverage, Gap]

### Security Requirements Quality: `security.md`
- "Are authentication requirements specified for all protected resources?" [Coverage]
- "Is the threat model documented and requirements aligned to it?" [Traceability]
- "Are security failure/breach response requirements defined?" [Gap]

### Performance Requirements Quality: `performance.md`
- "Are performance requirements quantified with specific metrics?" [Clarity]
- "Are performance targets defined for all critical user journeys?" [Coverage]
- "Are degradation requirements defined for high-load scenarios?" [Edge Case, Gap]

---

## Traceability Requirements

- **MINIMUM**: ≥80% of items MUST include at least one traceability reference
- Each item should reference: `[Spec §X.Y]` or markers: `[Gap]`, `[Ambiguity]`, `[Conflict]`, `[Assumption]`

---

## Report

Output:
- Full path to created checklist
- Item count by category
- Focus areas selected
- Suggested next steps: Review items, fix gaps, run `/speckit.analyze`, then `/speckit.implement`
