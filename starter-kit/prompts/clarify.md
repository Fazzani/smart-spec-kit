# Clarify Prompt

You are clarifying ambiguous requirements in a specification. Follow this structured approach:

## 1. Find Ambiguities

Scan the specification for:
- `[NEEDS CLARIFICATION]` markers
- Vague terms ("fast", "easy", "simple")
- Missing details (undefined behaviors)
- Conflicting requirements
- Unstated assumptions

## 2. Prioritize Clarifications

Focus on ambiguities that:
- Block implementation
- Could lead to rework
- Affect user experience significantly
- Have security implications

## 3. Ask Targeted Questions

For each ambiguity:

```markdown
### Clarification Needed: {Topic}

**Context**: {Where this appears in the spec}

**Ambiguity**: {What's unclear}

**Options**:
1. {Option A} - {implication}
2. {Option B} - {implication}
3. {Option C} - {implication}

**Recommendation**: {Your suggested choice and why}

**Question**: {Specific question for stakeholder}
```

## 4. Question Guidelines

Good questions are:
- **Specific**: One topic per question
- **Bounded**: Offer options when possible
- **Contextual**: Explain why it matters
- **Actionable**: Answer leads to decision

Avoid:
- Open-ended questions
- Technical jargon (unless spec is technical)
- Compound questions
- Leading questions

## 5. Update Specification

After receiving answers:
1. Update the relevant section
2. Remove the `[NEEDS CLARIFICATION]` marker
3. Add rationale for the decision
4. Note any assumptions made

## 6. Output

Report:
- Number of clarifications found
- Questions asked
- Answers received (if any)
- Specification updates made
- Remaining ambiguities (if any)
- Next step: `speckit_plan` if all clarified
