---
description: "Perform cross-artifact consistency and quality analysis before implementation"
mode: "agent"
tools: ["mcp_spec-kit_speckit_validate"]
---

# /speckit.analyze

Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md after task generation.

## User Input

```
$ARGUMENTS
```

You MUST consider the user input before proceeding (if not empty).

## Goal

Identify inconsistencies, duplications, ambiguities, and underspecified items across the three core artifacts (`spec.md`, `plan.md`, `tasks.md`) before implementation.

This command MUST run only after `/speckit.tasks` has successfully produced a complete `tasks.md`.

---

## Operating Constraints

**STRICTLY READ-ONLY**: Do not modify any files. Output a structured analysis report. Offer an optional remediation plan (user must explicitly approve before any editing).

**Constitution Authority**: The project constitution (`.spec-kit/memory/constitution.md`) is non-negotiable. Constitution conflicts are automatically **CRITICAL** and require adjustment of the spec, plan, or tasks—not dilution of the principle.

---

## Execution Steps

### 1. Initialize Analysis Context

Load from feature directory:
- `spec.md` (REQUIRED)
- `plan.md` (REQUIRED)
- `tasks.md` (REQUIRED)
- `.spec-kit/memory/constitution.md` (for principle validation)

If any required file is missing, abort with error message instructing user to run missing prerequisite command.

### 2. Load Artifacts (Progressive Disclosure)

Load only minimal necessary context from each artifact:

**From spec.md**:
- Overview/Context
- Functional Requirements
- Non-Functional Requirements
- User Stories
- Edge Cases (if present)

**From plan.md**:
- Architecture/stack choices
- Data Model references
- Phases
- Technical constraints

**From tasks.md**:
- Task IDs
- Descriptions
- Phase grouping
- Parallel markers `[P]`
- Referenced file paths

**From constitution**:
- Principle names
- MUST/SHOULD normative statements

### 3. Build Semantic Models

Create internal representations:
- **Requirements inventory**: Each functional + non-functional requirement with stable key
- **User story/action inventory**: Discrete user actions with acceptance criteria
- **Task coverage mapping**: Map each task to requirements or stories
- **Constitution rule set**: Extract principle names and normative statements

### 4. Detection Passes

Focus on high-signal findings. Limit to **50 findings total**; aggregate remainder in overflow summary.

#### A. Duplication Detection
- Identify near-duplicate requirements
- Mark lower-quality phrasing for consolidation

#### B. Ambiguity Detection
- Flag vague adjectives (fast, scalable, secure, intuitive, robust) lacking measurable criteria
- Flag unresolved placeholders (TODO, TKTK, ???, `<placeholder>`)

#### C. Underspecification
- Requirements with verbs but missing object or measurable outcome
- User stories missing acceptance criteria alignment
- Tasks referencing files or components not defined in spec/plan

#### D. Constitution Alignment
- Any requirement or plan element conflicting with a MUST principle
- Missing mandated sections or quality gates from constitution

#### E. Coverage Gaps
- Requirements with zero associated tasks
- Tasks with no mapped requirement/story
- Non-functional requirements not reflected in tasks (performance, security)

#### F. Inconsistency
- Terminology drift (same concept named differently across files)
- Data entities referenced in plan but absent in spec (or vice versa)
- Task ordering contradictions
- Conflicting requirements (e.g., one requires Next.js while other specifies Vue)

### 5. Severity Assignment

| Severity | Criteria |
|----------|----------|
| **CRITICAL** | Violates constitution MUST, missing core spec artifact, requirement with zero coverage blocking baseline functionality |
| **HIGH** | Duplicate or conflicting requirement, ambiguous security/performance attribute, untestable acceptance criterion |
| **MEDIUM** | Terminology drift, missing non-functional task coverage, underspecified edge case |
| **LOW** | Style/wording improvements, minor redundancy not affecting execution |

### 6. Produce Analysis Report

Output a Markdown report (no file writes):

```markdown
# Specification Analysis Report

**Feature**: [Feature Name]
**Analyzed**: [Date]
**Artifacts**: spec.md, plan.md, tasks.md

## Findings

| ID | Category | Severity | Location | Issue | Recommendation |
|----|----------|----------|----------|-------|----------------|
| A1 | Duplication | HIGH | spec.md:L120 | Two similar requirements... | Merge phrasing |
| B1 | Ambiguity | MEDIUM | spec.md:L45 | "Fast" not quantified | Add specific metric |
| D1 | Constitution | CRITICAL | plan.md:L30 | Violates simplicity principle | Justify or simplify |
| E1 | Coverage | HIGH | spec.md:FR-005 | No tasks mapped | Add tasks for FR-005 |

## Coverage Summary

| Category | Total | With Tasks | Coverage |
|----------|-------|------------|----------|
| Functional Requirements | 12 | 10 | 83% |
| Non-Functional Requirements | 5 | 3 | 60% |
| User Stories | 4 | 4 | 100% |

## Constitution Alignment Issues

- [List any principle violations]

## Unmapped Tasks

- [Tasks with no requirement mapping]

## Metrics

- **Total Requirements**: X
- **Total Tasks**: Y
- **Coverage %**: Z%
- **Ambiguity Count**: N
- **Duplication Count**: N
- **Critical Issues**: N
```

### 7. Provide Next Actions

At end of report:

- **If CRITICAL issues exist**: "⚠️ Resolve CRITICAL issues before `/speckit.implement`"
- **If only LOW/MEDIUM**: "✅ Safe to proceed. Consider improvements later."
- Provide explicit command suggestions:
  - "Run `/speckit.specify` with refinement for ambiguous requirements"
  - "Run `/speckit.plan` to adjust architecture"
  - "Manually edit tasks.md to add coverage for FR-005"

### 8. Offer Remediation

Ask: "Would you like me to suggest concrete remediation edits for the top N issues?"

**Do NOT apply changes automatically.**

---

## Operating Principles

### Context Efficiency
- Minimal high-signal tokens: Focus on actionable findings
- Progressive disclosure: Load artifacts incrementally
- Token-efficient output: Limit findings to 50 rows
- Deterministic results: Rerunning should produce consistent IDs

### Analysis Guidelines
- **NEVER** modify files (read-only analysis)
- **NEVER** hallucinate missing sections
- **Prioritize** constitution violations (always CRITICAL)
- **Use examples** over exhaustive rules
- **Report zero issues gracefully** with coverage statistics

---

## Context

This is the quality gate between planning and implementation. A clean analysis report indicates readiness for `/speckit.implement`.
