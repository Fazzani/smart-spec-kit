# Checklist Prompt

Generate a custom checklist for the current feature based on user requirements.

## Checklist Purpose: "Unit Tests for English"

**CRITICAL CONCEPT**: Checklists are **UNIT TESTS FOR REQUIREMENTS WRITING** - they validate the quality, clarity, and completeness of requirements in a given domain.

### What Checklists Are NOT For:
- ❌ "Verify the button clicks correctly"
- ❌ "Test error handling works"
- ❌ "Confirm the API returns 200"
- ❌ Checking if code/implementation matches the spec

### What Checklists ARE For:
- ✅ "Are visual hierarchy requirements defined for all card types?" (completeness)
- ✅ "Is 'prominent display' quantified with specific sizing/positioning?" (clarity)
- ✅ "Are hover state requirements consistent across all interactive elements?" (consistency)
- ✅ "Are accessibility requirements defined for keyboard navigation?" (coverage)
- ✅ "Does the spec define what happens when logo image fails to load?" (edge cases)

**Metaphor**: If your spec is code written in English, the checklist is its unit test suite. You're testing whether the requirements are well-written, complete, unambiguous, and ready for implementation - NOT whether the implementation works.

## Execution Steps

### 1. Setup

Locate the feature directory and available documentation (spec.md, plan.md, tasks.md).

### 2. Clarify Intent

Derive up to THREE contextual clarifying questions based on:
- User's phrasing
- Signals from spec/plan/tasks
- Feature domain keywords (auth, UX, API, etc.)
- Risk indicators ("critical", "must", "compliance")

Question archetypes:
- **Scope refinement**: "Should this include integration touchpoints?"
- **Risk prioritization**: "Which risk areas need mandatory gating checks?"
- **Depth calibration**: "Is this a lightweight pre-commit sanity list or formal release gate?"
- **Audience framing**: "Will this be used by author only or peers during PR review?"

### 3. Understand User Request

Combine arguments + clarifying answers:
- Derive checklist theme (security, review, deploy, ux)
- Consolidate explicit must-have items
- Map focus selections to category scaffolding

### 4. Load Feature Context

Read from feature directory:
- `spec.md`: Feature requirements and scope
- `plan.md` (if exists): Technical details, dependencies
- `tasks.md` (if exists): Implementation tasks

### 5. Generate Checklist

Create `specs/checklists/` directory if needed.

**CORE PRINCIPLE - Test the Requirements, Not the Implementation**:

Every checklist item MUST evaluate the REQUIREMENTS THEMSELVES for:
- **Completeness**: Are all necessary requirements present?
- **Clarity**: Are requirements unambiguous and specific?
- **Consistency**: Do requirements align with each other?
- **Measurability**: Can requirements be objectively verified?
- **Coverage**: Are all scenarios/edge cases addressed?

### Category Structure

Group items by requirement quality dimensions:
1. **Requirement Completeness** - Are all necessary requirements documented?
2. **Requirement Clarity** - Are requirements specific and unambiguous?
3. **Requirement Consistency** - Do requirements align without conflicts?
4. **Acceptance Criteria Quality** - Are success criteria measurable?
5. **Scenario Coverage** - Are all flows/cases addressed?
6. **Edge Case Coverage** - Are boundary conditions defined?
7. **Non-Functional Requirements** - Performance, Security, Accessibility specified?
8. **Dependencies & Assumptions** - Are they documented and validated?
9. **Ambiguities & Conflicts** - What needs clarification?

### How To Write Checklist Items

❌ **WRONG** (Testing implementation):
- "Verify landing page displays 3 episode cards"
- "Test hover states work on desktop"
- "Confirm logo click navigates home"

✅ **CORRECT** (Testing requirements quality):
- "Are the exact number and layout of featured episodes specified?" [Completeness]
- "Is 'prominent display' quantified with specific sizing/positioning?" [Clarity]
- "Are hover state requirements consistent across all interactive elements?" [Consistency]
- "Are keyboard navigation requirements defined for all interactive UI?" [Coverage]
- "Is the fallback behavior specified when logo image fails to load?" [Edge Cases]

### Item Structure

Each item should follow this pattern:
- Question format asking about requirement quality
- Focus on what's WRITTEN (or not written) in the spec/plan
- Include quality dimension in brackets [Completeness/Clarity/Consistency/etc.]
- Reference spec section `[Spec §X.Y]` when checking existing requirements
- Use `[Gap]` marker when checking for missing requirements

### Examples by Quality Dimension

**Completeness:**
- "Are error handling requirements defined for all API failure modes? [Gap]"
- "Are accessibility requirements specified for all interactive elements? [Completeness]"

**Clarity:**
- "Is 'fast loading' quantified with specific timing thresholds? [Clarity, Spec §NFR-2]"
- "Is 'prominent' defined with measurable visual properties? [Ambiguity, Spec §FR-4]"

**Consistency:**
- "Do navigation requirements align across all pages? [Consistency, Spec §FR-10]"
- "Are card component requirements consistent between landing and detail pages? [Consistency]"

**Coverage:**
- "Are requirements defined for zero-state scenarios (no episodes)? [Coverage, Edge Case]"
- "Are concurrent user interaction scenarios addressed? [Coverage, Gap]"

**Measurability:**
- "Are visual hierarchy requirements measurable/testable? [Acceptance Criteria, Spec §FR-1]"
- "Can 'balanced visual weight' be objectively verified? [Measurability, Spec §FR-2]"

### 🚫 Absolutely Prohibited

- ❌ Any item starting with "Verify", "Test", "Confirm", "Check" + implementation behavior
- ❌ References to code execution, user actions, system behavior
- ❌ "Displays correctly", "works properly", "functions as expected"
- ❌ "Click", "navigate", "render", "load", "execute"
- ❌ Test cases, test plans, QA procedures
- ❌ Implementation details (frameworks, APIs, algorithms)

### ✅ Required Patterns

- ✅ "Are [requirement type] defined/specified/documented for [scenario]?"
- ✅ "Is [vague term] quantified/clarified with specific criteria?"
- ✅ "Are requirements consistent between [section A] and [section B]?"
- ✅ "Can [requirement] be objectively measured/verified?"
- ✅ "Are [edge cases/scenarios] addressed in requirements?"
- ✅ "Does the spec define [missing aspect]?"

### 6. Structure Reference

Use this template:

```markdown
# [Checklist Type] Requirements Quality Checklist

**Purpose**: Validate specification completeness and quality before implementation
**Created**: [DATE]
**Feature**: [Link to spec.md]

## Requirement Completeness
- [ ] CHK001 - Are all functional requirements documented? [Completeness]
- [ ] CHK002 - Are error handling requirements defined? [Gap]

## Requirement Clarity
- [ ] CHK003 - Is 'fast' quantified with specific metrics? [Clarity, Spec §NFR-1]

## Scenario Coverage
- [ ] CHK004 - Are edge cases addressed? [Coverage]

## Notes
- Items marked incomplete require spec updates before `/speckit.implement`
```

### 7. Report

Output:
- Full path to created checklist
- Item count
- Summary of focus areas, depth level, actor/timing
- Reminder that each run creates a new file

## Example Checklist Types

- `ux.md` - UX Requirements Quality
- `api.md` - API Requirements Quality
- `security.md` - Security Requirements Quality
- `performance.md` - Performance Requirements Quality
- `accessibility.md` - Accessibility Requirements Quality
