# Validation Prompt

## Purpose

Execute validation checks against customizable rules after specific workflow phases.

## Validation Types

Spec-Kit supports multiple validation types:

1. **Security Validation** - Check security rules compliance
2. **RGPD Validation** - Check GDPR/RGPD compliance
3. **Architecture Validation** - Check architecture principles
4. **Custom Validation** - Check custom project rules

## Process

### 1. Load Rules

Load the appropriate rules file from `.spec-kit/rules/`:
- `security-rules.md` for security validation
- `rgpd-rules.md` for RGPD/GDPR validation
- Custom files as defined by user

### 2. Load Target Document

Load the document to validate:
- For **spec** phase: Load from `specs/*-spec.md`
- For **plan** phase: Load from `specs/plan.md`
- For **implementation** phase: Analyze recent code changes

### 3. Evaluate Each Rule

For each rule in the rules file:

1. Determine if the rule is applicable to this feature
2. Check if the requirement is addressed
3. Mark status: ✅ Compliant | ⚠️ Partial | ❌ Non-Compliant | ➖ N/A
4. Document evidence or gaps

### 4. Generate Report

Create a validation report with:
- Summary statistics
- Critical issues (blocking)
- Warnings (should fix)
- Recommendations (nice to have)

## Validation Triggers

Validations can be triggered:

- **Manually**: `speckit: validate security` or `speckit: validate rgpd`
- **In Workflow**: As a step in feature-full or custom workflows
- **After Phase**: Automatically after spec or implementation

## Output

Save validation reports to:
- `specs/validations/{type}-{date}.md`

## Instructions for Copilot

When performing validation:

1. **Be Thorough**: Check every applicable rule
2. **Be Specific**: Cite specific sections or code that address rules
3. **Be Constructive**: Provide actionable recommendations
4. **Be Honest**: Mark non-compliant if not addressed, don't assume

## Custom Rules

Users can create custom rules files in `.spec-kit/rules/`:

```markdown
# My Custom Rules

## Category Name

### RULE-001: Rule Title
- [ ] Checklist item 1
- [ ] Checklist item 2

### RULE-002: Another Rule
- [ ] Check this
- [ ] Check that
```

Then trigger with: `speckit: validate my-custom-rules`
