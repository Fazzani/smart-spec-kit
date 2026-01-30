# 🚀 Spec-Kit MCP Server

An AI-driven specification platform using **Model Context Protocol (MCP)** for VS Code & GitHub Copilot.

Transform Azure DevOps work items into comprehensive specification documents through guided workflows and intelligent agents.

## ✨ Features

- **🔄 Workflow Engine**: YAML-defined workflows guide the specification process step-by-step
- **🤖 AI Agents**: Specialized agents (SpecAgent, PlanAgent, GovAgent, TestAgent) for different tasks
- **📝 Template System**: Markdown templates with auto-fill capabilities
- **🔗 Azure DevOps Integration**: Works alongside the ADO MCP server for seamless data access
- **🎯 GitHub Copilot Native**: Designed specifically for VS Code + Copilot Chat

## 📦 Installation

### Prerequisites

- Node.js 18+ (LTS recommended)
- VS Code with GitHub Copilot extension
- Azure DevOps MCP server (optional, for ADO integration)

### Setup

1. **Clone and build the project:**

```bash
git clone <repository-url>
cd spec-kit-mcp
npm install
npm run build
```

2. **Configure VS Code:**

Open VS Code Settings (JSON) and add the Spec-Kit server to your MCP configuration:

```json
{
  "mcp": {
    "servers": {
      "spec-kit": {
        "command": "node",
        "args": ["D:\\path\\to\\spec-kit-mcp\\dist\\index.js"]
      }
    }
  }
}
```

> 💡 **Tip:** Run `npm run setup` to see the exact configuration for your system.

3. **Reload VS Code:**

Press `Ctrl+Shift+P` → "Developer: Reload Window"

4. **Verify installation:**

In Copilot Chat, ask: *"Use the ping tool from spec-kit"*

## 🛠 Available MCP Tools

### Core Tools

| Tool | Description |
|------|-------------|
| `ping` | Health check - verify server is running |
| `get_server_info` | Get server capabilities and info |

### Workflow Tools

| Tool | Description |
|------|-------------|
| `list_workflows` | List all available workflows |
| `start_workflow` | Start a workflow with a context ID (e.g., ADO work item ID) |
| `advance_workflow` | Move to the next step in a workflow |
| `get_template` | Retrieve a raw Markdown template |

### Agent Tools

| Tool | Description |
|------|-------------|
| `list_agents` | List available AI agents and their capabilities |
| `get_agent_prompt` | Get the full system prompt for an agent |
| `invoke_agent` | Activate an agent with a specific task |

## 🔄 Workflows

Workflows are YAML files that define step-by-step processes for creating specifications.

### Available Workflows

- **feature-standard**: Create functional specifications from Feature work items

### Workflow Structure

```yaml
name: feature-standard
displayName: "Feature Specification"
description: "Creates a functional specification from an ADO Feature"
template: functional-spec.md
defaultAgent: SpecAgent

steps:
  - id: fetch-workitem
    name: "Fetch Azure DevOps Work Item"
    action: fetch_ado
    description: "Retrieve the Feature work item from Azure DevOps..."
    
  - id: generate-spec
    name: "Generate Specification"
    action: generate_content
    agent: SpecAgent
    description: "Generate the specification document..."
```

### Creating Custom Workflows

1. Create a new `.yaml` file in `/workflows`
2. Define steps with actions: `fetch_ado`, `generate_content`, `review`, `create_file`, `call_agent`
3. Reference a template from `/templates`

## 🤖 AI Agents

Agents are specialized AI personas with focused capabilities:

| Agent | Role | Use Case |
|-------|------|----------|
| **SpecAgent** | Specification Writer | Creating detailed specs from requirements |
| **PlanAgent** | Technical Planner | Breaking features into implementation tasks |
| **GovAgent** | Quality Reviewer | Reviewing docs for completeness & compliance |
| **TestAgent** | Test Designer | Creating test strategies and test cases |

## 📁 Project Structure

```
spec-kit-mcp/
├── src/
│   ├── index.ts              # MCP Server entrypoint
│   ├── tools/
│   │   ├── workflowTools.ts  # Workflow management tools
│   │   └── agentTools.ts     # Agent invocation tools
│   ├── prompts/
│   │   └── agents.ts         # Agent system prompts
│   ├── schemas/
│   │   └── workflowSchema.ts # Zod validation schemas
│   └── utils/
│       ├── workflowLoader.ts # YAML workflow loader
│       ├── markdownGenerator.ts # Template filling
│       └── vsCodeConfigGenerator.ts
├── workflows/                 # Workflow YAML definitions
│   └── feature-standard.yaml
├── templates/                 # Markdown templates
│   └── functional-spec.md
├── dist/                      # Compiled output
├── package.json
└── tsconfig.json
```

## 🚀 Usage Example

### Creating a Feature Specification

1. **Start the workflow** in Copilot Chat:
   
   *"Start the feature-standard workflow for work item 12345"*

2. **Copilot will guide you** through each step:
   - Fetch the work item from Azure DevOps
   - Analyze requirements with SpecAgent
   - Generate the specification document
   - Review with GovAgent
   - Save the final document

3. **Review and refine** the generated specification

### Using Agents Directly

*"Invoke the PlanAgent to break down this feature into tasks: [paste requirements]"*

## 🔧 Development

### Scripts

```bash
npm run build    # Compile TypeScript
npm run dev      # Watch mode development
npm run start    # Run the server
npm run setup    # Show VS Code config instructions
```

### Adding New Tools

1. Create a new file in `src/tools/`
2. Export a `registerXxxTools(server: McpServer)` function
3. Import and call it in `src/index.ts`

## 🤝 Integration with Azure DevOps MCP

This server is designed to work alongside the official Azure DevOps MCP server:

```json
{
  "mcp": {
    "servers": {
      "azure-devops": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-azure-devops"],
        "env": {
          "AZURE_DEVOPS_ORG_URL": "https://dev.azure.com/your-org",
          "AZURE_DEVOPS_PAT": "your-personal-access-token"
        }
      },
      "spec-kit": {
        "command": "node",
        "args": ["path/to/spec-kit-mcp/dist/index.js"]
      }
    }
  }
}
```

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)
- Validation with [Zod](https://zod.dev)
- YAML parsing with [js-yaml](https://github.com/nodeca/js-yaml)
