# [CHECKLIST_TYPE] Requirements Quality Checklist

**Purpose**: Validate specification completeness and quality before implementation
**Created**: [DATE]
**Feature**: [FEATURE_NAME]
**Spec**: [Link to spec.md]

---

## Requirement Completeness

- [ ] CHK001 - Are all functional requirements documented with unique IDs? [Completeness]
- [ ] CHK002 - Are non-functional requirements (performance, security, accessibility) specified? [Completeness, Gap]
- [ ] CHK003 - Are error handling requirements defined for all failure modes? [Completeness]
- [ ] CHK004 - Are data validation requirements specified for all inputs? [Completeness]

---

## Requirement Clarity

- [ ] CHK005 - Are all vague terms ('fast', 'scalable', 'intuitive') quantified with specific metrics? [Clarity]
- [ ] CHK006 - Are acceptance criteria written in testable Given/When/Then format? [Clarity]
- [ ] CHK007 - Are all acronyms and technical terms defined? [Clarity]
- [ ] CHK008 - Are visual/UI requirements specific enough to implement without guesswork? [Clarity]

---

## Requirement Consistency

- [ ] CHK009 - Do requirements use consistent terminology throughout? [Consistency]
- [ ] CHK010 - Are there any conflicting requirements? [Consistency, Conflict]
- [ ] CHK011 - Do UI requirements align with technical constraints? [Consistency]
- [ ] CHK012 - Are data models consistent between spec and plan? [Consistency]

---

## Acceptance Criteria Quality

- [ ] CHK013 - Does every requirement have measurable acceptance criteria? [Measurability]
- [ ] CHK014 - Can acceptance criteria be verified without implementation knowledge? [Measurability]
- [ ] CHK015 - Are success metrics defined for the feature? [Measurability]

---

## Scenario Coverage

- [ ] CHK016 - Are primary user flows documented? [Coverage]
- [ ] CHK017 - Are alternate flows (happy paths variations) specified? [Coverage]
- [ ] CHK018 - Are exception/error flows defined? [Coverage]
- [ ] CHK019 - Are recovery flows (rollback, retry) specified where applicable? [Coverage]

---

## Edge Case Coverage

- [ ] CHK020 - Are boundary conditions defined (min/max values, empty states)? [Edge Case]
- [ ] CHK021 - Are concurrent user scenarios addressed? [Edge Case]
- [ ] CHK022 - Are timeout/partial failure scenarios specified? [Edge Case]
- [ ] CHK023 - Are mobile/responsive edge cases covered? [Edge Case]

---

## Non-Functional Requirements

- [ ] CHK024 - Are performance requirements quantified (response time, throughput)? [NFR]
- [ ] CHK025 - Are security requirements aligned with threat model? [NFR, Security]
- [ ] CHK026 - Are accessibility requirements specified (WCAG level)? [NFR, A11y]
- [ ] CHK027 - Are scalability requirements defined? [NFR]

---

## Dependencies & Assumptions

- [ ] CHK028 - Are external dependencies documented? [Dependency]
- [ ] CHK029 - Are assumptions validated or flagged for verification? [Assumption]
- [ ] CHK030 - Are integration points clearly specified? [Dependency]

---

## Constitution Alignment

- [ ] CHK031 - Does the spec align with project core principles? [Constitution]
- [ ] CHK032 - Are coding standards from constitution referenced? [Constitution]
- [ ] CHK033 - Are security/privacy principles respected? [Constitution]

---

## Notes

- Items marked `[Gap]` indicate missing requirements that should be added
- Items marked `[Conflict]` indicate inconsistencies that must be resolved
- Items marked `[Assumption]` need validation before implementation
- Complete all CRITICAL items before proceeding to `/speckit.implement`

---

## Summary

| Category | Total | Passed | Failed | Pending |
|----------|-------|--------|--------|---------|
| Completeness | | | | |
| Clarity | | | | |
| Consistency | | | | |
| Coverage | | | | |
| NFR | | | | |
| **Total** | | | | |
