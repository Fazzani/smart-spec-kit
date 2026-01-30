# 🏗 PROJECT CONTEXT: Spec-Kit

## 🎯 Vision
Plateforme d'orchestration automatisée pour le **développement piloté par les spécifications** (Spec-Driven Development) via **GitHub Copilot** et **MCP** (Model Context Protocol).

## 📐 Architecture Technique

L'architecture est centrée sur VS Code agissant comme HUB pour le serveur MCP Spec-Kit :

### Composants

1. **MCP Server** (`smart-spec-kit-mcp`)
   - Serveur Node.js/TypeScript
   - Expose des outils via Model Context Protocol
   - Communique avec GitHub Copilot

2. **Slash Commands** (`.github/prompts/`)
   - Commandes natives GitHub Copilot (`/speckit.*`)
   - Déclenchent les outils MCP directement

3. **Prompts** (`.spec-kit/prompts/`)
   - Prompts personnalisables lus par les outils MCP
   - Définissent le comportement de chaque commande

4. **Templates** (`.spec-kit/templates/`)
   - Templates de documents (specs, plans, tasks)
   - Format Markdown

5. **Rules** (`.spec-kit/rules/`)
   - Règles de validation (sécurité, RGPD, custom)
   - Checklists Markdown

6. **Workflows** (`.spec-kit/workflows/`)
   - Définitions YAML de workflows multi-étapes
   - Processus automatisés

## 🛠 Tech Stack
- **Runtime:** Node.js (Latest LTS)
- **Language:** TypeScript
- **Framework:** `@modelcontextprotocol/sdk`
- **Format:** YAML (Workflows), Markdown (Templates/Prompts), JSON Schema
- **Client:** VS Code + GitHub Copilot Chat Extension

## 📂 Structure de dossier

```
smart-spec-kit/
├── src/
│   ├── tools/           # Outils MCP (speckit_specify, etc.)
│   ├── prompts/         # System prompts pour agents
│   ├── utils/           # Utilitaires (YAML parsers, Template engines)
│   └── engine/          # Workflow engine
├── workflows/           # Définitions YAML des workflows
├── templates/           # Templates Markdown
├── starter-kit/         # Kit d'installation pour projets
│   ├── prompts/         # Prompts par défaut
│   ├── templates/       # Templates par défaut
│   ├── memory/          # Constitution par défaut
│   ├── rules/           # Règles de validation
│   ├── workflows/       # Workflows par défaut
│   └── github-prompts/  # Slash commands (.prompt.md)
└── schemas/             # Schémas de validation
```

## 🔗 Intégration optionnelle Azure DevOps
Peut être utilisé avec le serveur `@modelcontextprotocol/server-azure-devops` pour récupérer automatiquement les work items.