# Constitution Prompt

Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync.

## 1. Understanding

The constitution at `.spec-kit/memory/constitution.md` is a **TEMPLATE** containing placeholder tokens in square brackets (e.g., `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`). Your job is to:

1. **Collect/derive concrete values** from user input or project context
2. **Fill the template precisely** with real project principles
3. **Propagate any amendments** across dependent artifacts

## 2. Execution Flow

### Step 1: Load Existing Constitution

Load `.spec-kit/memory/constitution.md` and identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]`.

**Important**: The user might require fewer or more principles than the template. Respect their specified number.

### Step 2: Collect Values for Placeholders

For each placeholder:

- **If user input supplies a value**: Use it directly
- **Otherwise infer from**: README, docs, prior constitution versions, project context
- **For dates**:
  - `RATIFICATION_DATE`: Original adoption date (ask if unknown, or mark TODO)
  - `LAST_AMENDED_DATE`: Today if changes are made
- **For version**: Apply semantic versioning:
  - MAJOR: Backward incompatible governance/principle removals or redefinitions
  - MINOR: New principle/section added or materially expanded guidance
  - PATCH: Clarifications, wording, typo fixes

### Step 3: Draft Updated Constitution

- Replace every placeholder with concrete text
- No bracketed tokens should remain (except intentionally retained with justification)
- Preserve heading hierarchy
- Each Principle section should include:
  - Succinct name
  - Non-negotiable rules (paragraph or bullet list)
  - Explicit rationale if not obvious
- Governance section should list:
  - Amendment procedure
  - Versioning policy
  - Compliance review expectations

### Step 4: Consistency Propagation Checklist

After updating, verify alignment with:

- `.spec-kit/templates/plan-template.md` - Rules align with principles
- `.spec-kit/templates/functional-spec.md` - Scope/requirements alignment
- `.spec-kit/templates/tasks-template.md` - Task categorization reflects principles
- `README.md` - References to principles are current

### Step 5: Produce Sync Impact Report

Add as a summary at the end of your response:

- Version change: old → new
- List of modified principles
- Added sections
- Removed sections
- Templates requiring updates (✅ updated / ⚠️ pending)
- Follow-up TODOs if any placeholders deferred

### Step 6: Validation

Before final output, verify:

- No remaining unexplained bracket tokens
- Version line matches report
- Dates in ISO format (YYYY-MM-DD)
- Principles are declarative, testable, free of vague language

### Step 7: Write and Report

1. Write completed constitution to `.spec-kit/memory/constitution.md`
2. Output summary with:
   - New version and bump rationale
   - Files flagged for manual follow-up
   - Suggested commit message (e.g., `docs: amend constitution to vX.Y.Z`)

## 3. Formatting Requirements

- Use Markdown headings exactly as in the template
- Keep readability (<100 chars per line)
- Single blank line between sections
- No trailing whitespace

## 4. Partial Updates

If user supplies partial updates (e.g., only one principle revision):

- Still perform validation and version decision steps
- Only update the specified sections

## 5. Missing Information

If critical info is missing (e.g., ratification date unknown):

- Insert `TODO(<FIELD_NAME>): explanation`
- Include in Sync Impact Report under deferred items

## 6. Interactive Mode

**PREFERRED: Use the `askQuestions` tool** for structured interactive collection of constitution values.

If no arguments provided, use `askQuestions` to guide the user:

### Question 1: Project Identity

```json
{
  "questions": [{
    "header": "Project Name",
    "question": "What is the name of your project?",
    "allowFreeformInput": true
  }]
}
```

### Question 2: Core Principles (batch these)

```json
{
  "questions": [
    {
      "header": "Principles",
      "question": "Select the core principles that should govern this project (you can select multiple):",
      "multiSelect": true,
      "options": [
        { "label": "Code Quality", "description": "Tests, reviews, documentation" },
        { "label": "Security First", "description": "OWASP, input validation, encryption", "recommended": true },
        { "label": "User Privacy", "description": "GDPR, data minimization" },
        { "label": "Performance", "description": "Response times, scalability targets" },
        { "label": "Accessibility", "description": "WCAG compliance" },
        { "label": "Simplicity", "description": "No premature abstractions" }
      ],
      "allowFreeformInput": true
    },
    {
      "header": "Tech Stack",
      "question": "What is your primary tech stack? (e.g., 'TypeScript, React, Node.js, PostgreSQL')",
      "allowFreeformInput": true
    },
    {
      "header": "Conventions",
      "question": "Any specific coding standards to enforce? (e.g., 'ESLint strict, Prettier, conventional commits')",
      "allowFreeformInput": true
    }
  ]
}
```

### Fallback: Plain Text

If `askQuestions` is not available, guide through plain questions:

1. **Project Name**: "What is the name of your project?"
2. **Core Principles**: "What are the 3-5 core principles that should govern this project?"
3. **Tech Stack**: "What technologies are you using?"
4. **Coding Conventions**: "Any specific coding standards to enforce?"
5. **Governance**: "Who can amend these principles?"

Provide suggested defaults based on project context when possible.
