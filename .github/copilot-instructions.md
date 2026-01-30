# Copilot Instructions for Spec-Kit

## Project Context

Spec-Kit is an MCP (Model Context Protocol) server that automates specification workflows for GitHub Copilot. It transforms Azure DevOps work items into comprehensive specification documents through guided, automated workflows.

## Architecture

- **Session Manager**: Persists workflow state across MCP calls
- **Workflow Engine**: Orchestrates steps with auto-prompting
- **Orchestration Tools**: MCP tools (start_workflow, execute_step, etc.)
- **Agents**: SpecAgent, PlanAgent, GovAgent, TestAgent

## Key Concepts

### Auto-Prompting

Each tool response includes a `copilotInstruction` that tells Copilot exactly what to do next. The user only validates with "OK".

### Workflow Sessions

Sessions persist in the OS temp directory (`spec-kit-sessions/`). Each session tracks:
- Current step index
- Collected data from previous steps
- Validation results
- Generated artifacts

## Code Style

- TypeScript with strict mode
- ES2022 target, ESM modules
- Zod for schema validation
- YAML for workflow definitions

## When Working on This Project

1. **Workflows**: Edit YAML files in `/workflows`
2. **Templates**: Edit Markdown files in `/templates`
3. **Agents**: Edit prompts in `/src/prompts/agents.ts`
4. **Tools**: Edit `/src/tools/orchestrationTools.ts`
5. **Engine**: Edit `/src/engine/` files

## Testing

After changes, run:
```bash
npm run build
```

Then test in Copilot Chat:
```
@spec-kit ping
@spec-kit list_workflows
@spec-kit start_workflow workflow_name="feature-standard" context_id="TEST"
```
