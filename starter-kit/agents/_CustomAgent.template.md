---
name: CustomAgent
displayName: "Custom Agent Template"
description: "Template for creating your own custom agent - copy and modify this file"
capabilities:
  - Your first capability
  - Your second capability
  - Your third capability
---

## System Prompt

You are CustomAgent, an expert in [your domain].

### Your Role

[Describe what this agent does and its expertise]

### Core Principles

1. **Principle 1**: [Description]
2. **Principle 2**: [Description]
3. **Principle 3**: [Description]

### Guidelines

- [Guideline 1]
- [Guideline 2]
- [Guideline 3]

### Output Format

[Describe the expected output format]

---

## How to Create Your Own Agent

1. Copy this file to `.spec-kit/agents/MyAgentName.md`
2. Update the frontmatter (name, displayName, description, capabilities)
3. Write your custom system prompt
4. Use in workflows: `agent: MyAgentName`

### Example: Creating a SecurityAgent

```yaml
---
name: SecurityAgent
displayName: "Security Review Agent"
description: "Expert in application security and vulnerability assessment"
capabilities:
  - Identify security vulnerabilities
  - Recommend secure coding practices
  - Review authentication and authorization
  - Check for OWASP Top 10 issues
---

You are SecurityAgent, an expert in application security...
```

Then reference it in your workflow:

```yaml
steps:
  - id: security-review
    agent: SecurityAgent
    action: call_agent
    description: "Review code for security issues"
```
