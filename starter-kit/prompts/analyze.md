# Analyze Prompt

Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md after task generation.

## Goal

Identify inconsistencies, duplications, ambiguities, and underspecified items across the three core artifacts (`spec.md`, `plan.md`, `tasks.md`) before implementation. This command should run after `/speckit.tasks` has produced a complete tasks breakdown.

## Operating Constraints

**STRICTLY READ-ONLY**: Do not modify any files. Output a structured analysis report. Offer an optional remediation plan (user must explicitly approve before any edits).

**Constitution Authority**: The project constitution (`.spec-kit/memory/constitution.md`) is non-negotiable. Constitution conflicts are automatically CRITICAL and require adjustment of the spec, plan, or tasks—not dilution of the principle.

## Execution Steps

### 1. Initialize Analysis Context

Locate the feature directory and identify:
- `spec.md` or `*-spec.md`: Feature requirements and scope
- `plan.md` or `*-plan.md`: Technical implementation plan
- `tasks.md` or `*-tasks.md`: Task breakdown

Abort with an error message if any required file is missing.

### 1.1 Codebase Exploration (Search Subagent)

For `tasks-to-implementation` or `full-traceability` analysis, use the **search subagent** (`runSubagent`) to explore the codebase:
- Delegate file searches to preserve your main analysis context
- Ask: "Find all files implementing {requirement}", "Check if {component} exists"
- The subagent scans broadly and returns only relevant findings
- Use this to verify implementation coverage without overloading your context

### 2. Load Artifacts (Progressive Disclosure)

Load only the minimal necessary context from each artifact:

**From spec.md:**
- Overview/Context
- Functional Requirements
- Non-Functional Requirements
- User Stories
- Edge Cases (if present)

**From plan.md:**
- Architecture/stack choices
- Data Model references
- Phases
- Technical constraints

**From tasks.md:**
- Task IDs
- Descriptions
- Phase grouping
- Dependencies

**From constitution:**
- Load `.spec-kit/memory/constitution.md` for principle validation

### 3. Build Semantic Models

Create internal representations (do not include raw artifacts in output):

- **Requirements inventory**: Each functional + non-functional requirement with a stable key
- **User story/action inventory**: Discrete user actions with acceptance criteria
- **Task coverage mapping**: Map each task to one or more requirements or stories
- **Constitution rule set**: Extract principle names and MUST/SHOULD normative statements

### 4. Detection Passes

Focus on high-signal findings. Limit to 50 findings total.

#### A. Duplication Detection
- Identify near-duplicate requirements
- Mark lower-quality phrasing for consolidation

#### B. Ambiguity Detection
- Flag vague adjectives (fast, scalable, secure, intuitive, robust) lacking measurable criteria
- Flag unresolved placeholders (TODO, TKTK, ???, `<placeholder>`, etc.)

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
- Non-functional requirements not reflected in tasks (e.g., performance, security)

#### F. Inconsistency
- Terminology drift (same concept named differently across files)
- Data entities referenced in plan but absent in spec (or vice versa)
- Task ordering contradictions
- Conflicting requirements

### 5. Severity Assignment

- **CRITICAL**: Violates constitution MUST, missing core artifact, or requirement with zero coverage that blocks baseline functionality
- **HIGH**: Duplicate or conflicting requirement, ambiguous security/performance attribute, untestable acceptance criterion
- **MEDIUM**: Terminology drift, missing non-functional task coverage, underspecified edge case
- **LOW**: Style/wording improvements, minor redundancy

### 6. Produce Compact Analysis Report

Output a Markdown report with this structure:

```markdown
# Specification Analysis Report

**Feature**: [Feature Name]
**Analyzed**: [Date]
**Artifacts**: spec.md ✓ | plan.md ✓ | tasks.md ✓

## Findings Summary

| ID | Category | Severity | Location | Issue | Recommendation |
|----|----------|----------|----------|-------|----------------|
| A1 | Duplication | HIGH | spec.md:L120 | Two similar requirements | Merge phrasing |
| B1 | Ambiguity | MEDIUM | plan.md:L45 | "fast" undefined | Add metrics |

## Coverage Summary

| Requirement | Tasks Mapped | Status |
|-------------|--------------|--------|
| FR-001 | T1, T3 | ✓ Covered |
| FR-002 | - | ⚠ No coverage |

## Constitution Alignment Issues
(if any)

## Unmapped Tasks
(if any)

## Metrics
- Total Requirements: X
- Total Tasks: Y
- Coverage %: Z%
- Ambiguity Count: N
- Duplication Count: N
- Critical Issues: N
```

### 7. Provide Next Actions

- If CRITICAL issues exist: Recommend resolving before `/speckit.implement`
- If only LOW/MEDIUM: User may proceed, provide improvement suggestions
- Provide explicit command suggestions (e.g., "Run /speckit.specify with refinement")

### 8. Offer Remediation

Ask: "Would you like me to suggest concrete remediation edits for the top N issues?" (Do NOT apply them automatically.)

## Operating Principles

### Context Efficiency
- Minimal high-signal tokens: Focus on actionable findings
- Progressive disclosure: Load artifacts incrementally
- Token-efficient output: Limit findings table to 50 rows
- Deterministic results: Rerunning should produce consistent IDs

### Analysis Guidelines
- **NEVER** modify files (this is read-only analysis)
- **NEVER** hallucinate missing sections
- Prioritize constitution violations (always CRITICAL)
- Use examples over exhaustive rules
- Report zero issues gracefully (emit success report with coverage statistics)
