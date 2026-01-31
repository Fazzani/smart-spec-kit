---
description: "Generate custom quality checklists for requirements validation"
mode: speckit.checklist
---

# /speckit.checklist

Generate a custom checklist that validates requirements completeness, clarity, and consistency - like "unit tests for English".

## Instructions

Use the MCP tool `speckit_checklist` to generate a requirements quality checklist.

**Important**: Checklists test the QUALITY of requirements, NOT the implementation.

## Arguments

$ARGUMENTS

## Purpose

Checklists are **unit tests for requirements writing**. They validate:
- **Completeness**: Are all necessary requirements present?
- **Clarity**: Are requirements unambiguous and specific?
- **Consistency**: Do requirements align with each other?
- **Measurability**: Can requirements be objectively verified?
- **Coverage**: Are all scenarios/edge cases addressed?

## What Checklists Check

✅ **Correct** (Testing requirements quality):
- "Are visual hierarchy requirements defined for all card types?"
- "Is 'prominent display' quantified with specific sizing?"
- "Are error handling requirements specified for all failure modes?"

❌ **Wrong** (Testing implementation):
- "Verify the button clicks correctly"
- "Test error handling works"
- "Confirm the API returns 200"

## Checklist Types

- `ux` - UX Requirements Quality
- `api` - API Requirements Quality
- `security` - Security Requirements Quality
- `performance` - Performance Requirements Quality
- `accessibility` - Accessibility Requirements Quality

## Examples

```
/speckit.checklist ux
/speckit.checklist security for authentication module
/speckit.checklist api focus on error handling
/speckit.checklist Create a checklist for the login feature
```

## Output

A checklist file at `specs/checklists/[type].md` with:
- Numbered items (CHK001, CHK002, etc.)
- Quality dimension tags [Completeness], [Clarity], [Gap], etc.
- Spec section references where applicable

## Next Steps

- Review checklist items against your spec
- Fix any gaps or ambiguities identified
- Run `/speckit.analyze` for cross-artifact consistency
- Proceed to `/speckit.implement` once all critical items pass
