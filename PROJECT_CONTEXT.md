# 🏗 PROJECT CONTEXT: Spec-Kit Industrialized

## 🎯 Vision
Nous construisons une plateforme d'ingénierie "AI-driven" basée sur le pattern **Multi-MCP (Model Context Protocol)**.
L'objectif est d'orchestrer la création de spécifications, plans techniques et tâches Azure DevOps directement depuis VS Code, via GitHub Copilot.

## 📐 Architecture Technique
L'architecture est centrée sur VS Code agissant comme HUB pour deux serveurs MCP :

1.  **Server A (Microsoft ADO):** Le serveur officiel `@modelcontextprotocol/server-azure-devops`. Gère l'accès brut aux données (CRUD Work Items, Git).
2.  **Server B (Spec-Kit Custom):** Notre serveur Node.js/TypeScript custom. Gère la logique métier, les Workflows (YAML), les Templates (Markdown) et les Prompts Système.

### Flux de données
User (VS Code) -> Spec-Kit Server (Load Workflow) -> Instruction to Copilot -> ADO Server (Fetch Data) -> Spec-Kit Server (Generate Content).

## 🛠 Tech Stack
- **Runtime:** Node.js (Latest LTS)
- **Language:** TypeScript
- **Framework:** `@modelcontextprotocol/sdk`
- **Format:** YAML (Workflow definitions), Markdown (Templates), JSON Schema.
- **Client:** VS Code + GitHub Copilot Chat Extension.

## 📂 Structure de dossier cible
/spec-kit-mcp
  /src
    /tools (Logic for workflow engine)
    /prompts (System prompts for agents)
    /utils (YAML parsers, Template engines)
  /workflows (The YAML definitions: feature.yaml, bugfix.yaml)
  /templates (The Markdown skeletons)
  /schemas (Validation schemas for workflows)