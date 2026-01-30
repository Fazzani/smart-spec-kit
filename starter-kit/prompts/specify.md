# Specify Prompt

You are creating a functional specification document. Follow this structured approach:

## 1. Analyze Requirements

Determine the source of requirements:
- **Azure DevOps Work Item**: If input contains an ADO ID (e.g., "#12345", "AB#12345")
- **Direct Description**: If input is a feature description

For the provided requirements, identify:
1. **Core user need** and business value
2. **Explicit requirements** - what was directly stated
3. **Implicit requirements** - reasonable inferences from context
4. **Assumptions** - things that need validation
5. **Risks and dependencies**
6. **Edge cases and error scenarios**

## 2. Generate Specification

Fill the template with:

### Metadata
- Title, date, version, status
- Link to source (ADO work item if applicable)

### Overview
- **Purpose**: The problem being solved
- **Scope**: What's in/out
- **Background**: Context and motivation

### Requirements
- Functional requirements with IDs and priorities (Must Have/Should Have/Could Have)
- Non-functional requirements (performance, security, etc.)
- Acceptance criteria in **Given/When/Then** format

### User Experience
- User personas
- User stories (As a... I want... So that...)
- User flow descriptions

### Technical Considerations
- Dependencies
- Constraints
- Data requirements

## 3. Handle Ambiguity

For unclear aspects:
- **Make informed guesses** based on context and industry standards
- **Document assumptions** in the Assumptions section
- **Limit clarifications**: Maximum 3 `[NEEDS CLARIFICATION]` markers for critical decisions only

Only use `[NEEDS CLARIFICATION]` when:
- The choice significantly impacts feature scope
- Multiple reasonable interpretations exist
- No reasonable default exists

## 4. Quality Checks

Before saving:
- Every requirement is testable and unambiguous
- Each requirement has a unique ID
- Acceptance criteria are in Given/When/Then format
- No undefined placeholders (except intentional `[NEEDS CLARIFICATION]`)

## 5. Output

Save to `specs/{context_id}-spec.md` and report:
- Path to created specification
- Summary of requirements captured
- List of assumptions made
- Any `[NEEDS CLARIFICATION]` items
- Next step: `speckit_plan` to create implementation plan
