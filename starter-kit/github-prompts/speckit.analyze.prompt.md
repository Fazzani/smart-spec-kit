---
description: "Analyze cross-artifact consistency and coverage before implementation"
mode: speckit.analyze
---

# /speckit.analyze

Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md.

## Instructions

Use the MCP tool `speckit_analyze` to perform a read-only analysis of the feature artifacts.

This command should be run **after** `/speckit.tasks` and **before** `/speckit.implement`.

## Arguments

$ARGUMENTS

## What It Checks

1. **Duplication Detection** - Near-duplicate requirements
2. **Ambiguity Detection** - Vague terms without measurable criteria
3. **Underspecification** - Missing acceptance criteria or outcomes
4. **Constitution Alignment** - Conflicts with project principles
5. **Coverage Gaps** - Requirements without tasks, tasks without requirements
6. **Inconsistency** - Terminology drift, conflicting requirements

## Severity Levels

- **CRITICAL**: Constitution violations, missing core coverage
- **HIGH**: Duplicates, conflicts, untestable criteria
- **MEDIUM**: Terminology drift, edge case gaps
- **LOW**: Style/wording improvements

## Examples

```
/speckit.analyze
/speckit.analyze focus on security requirements
/speckit.analyze check coverage for FR-001 through FR-010
```

## Output

A structured report with:
- Findings table (ID, Category, Severity, Location, Issue, Recommendation)
- Coverage summary
- Constitution alignment issues
- Metrics (total requirements, tasks, coverage %)

## Next Steps

- If CRITICAL issues: Resolve before `/speckit.implement`
- If only LOW/MEDIUM: Safe to proceed, consider improvements later
- Use suggested remediation commands to fix issues
