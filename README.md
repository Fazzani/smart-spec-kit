# 🚀 Spec-Kit MCP Server

[![npm version](https://img.shields.io/npm/v/smart-spec-kit-mcp.svg)](https://www.npmjs.com/package/smart-spec-kit-mcp)
[![CI/CD](https://github.com/anthropic-ai/smart-spec-kit/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/anthropic-ai/smart-spec-kit/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Plateforme d'orchestration automatisée pour transformer vos work items Azure DevOps en spécifications complètes via **GitHub Copilot**.

## ✨ Fonctionnalités

- **🤖 Orchestration Automatisée**: Un seul prompt, Copilot fait le reste
- **🔄 Workflows YAML**: Processus personnalisables étape par étape
- **🛡️ Gouvernance Intégrée**: RGPD, Sécurité, Architecture, Design System
- **📝 Templates**: Spécifications, bugfix reports, documentation
- **🔗 Azure DevOps**: Intégration native via MCP

---

## ⚡ Installation

### Via NPX (Recommandé - Zero Config)

Ajoutez dans VS Code `settings.json` (`Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"):

```json
{
  "mcp": {
    "servers": {
      "spec-kit": {
        "command": "npx",
        "args": ["-y", "smart-spec-kit-mcp"]
      }
    }
  }
}
```

Rechargez VS Code (`Ctrl+Shift+P` → "Developer: Reload Window").

### Installation Globale

```bash
npm install -g smart-spec-kit-mcp
```

```json
{
  "mcp": {
    "servers": {
      "spec-kit": {
        "command": "spec-kit-mcp"
      }
    }
  }
}
```

### Vérification

Dans Copilot Chat:

```text
Utilise le tool ping de spec-kit
```

---

## 🚀 Usage

### Démarrer un Workflow

```text
@spec-kit start_workflow workflow_name="feature-standard" context_id="12345"
```

Le serveur orchestre automatiquement:

1. Récupération du work item Azure DevOps
2. Génération de la spécification (SpecAgent)
3. Planification technique (PlanAgent)
4. Validation gouvernance (GovAgent)
5. Création des artefacts

> Validez chaque étape avec "OK" - c'est tout!

### Workflows Disponibles

| Workflow           | Description                              |
| ------------------ | ---------------------------------------- |
| `feature-standard` | Spécification fonctionnelle (5 étapes)   |
| `feature-full`     | Spec + gouvernance complète (10 étapes)  |
| `bugfix`           | Rapport de correction de bug (5 étapes)  |

---

## 🛠 MCP Tools

### Orchestration

| Tool              | Description                     |
| ----------------- | ------------------------------- |
| `start_workflow`  | Démarre un workflow automatisé  |
| `execute_step`    | Continue à l'étape suivante     |
| `workflow_status` | Statut de la session active     |
| `list_workflows`  | Liste les workflows disponibles |
| `abort_workflow`  | Annule le workflow en cours     |
| `init`            | Initialise la config locale     |
| `config`          | Affiche la configuration        |

### Utilitaires

| Tool   | Description             |
| ------ | ----------------------- |
| `ping` | Health check du serveur |
| `help` | Aide et documentation   |

---

## 🤖 Agents IA

| Agent         | Rôle          | Utilisation                      |
| ------------- | ------------- | -------------------------------- |
| **SpecAgent** | Rédacteur     | Spécifications fonctionnelles    |
| **PlanAgent** | Planificateur | Découpage en tâches techniques   |
| **GovAgent**  | Validateur    | Conformité RGPD, Sécurité, Archi |
| **TestAgent** | Testeur       | Stratégies et cas de tests       |

---

## 🔗 Intégration Azure DevOps

Pour activer l'intégration ADO, ajoutez le serveur MCP Azure DevOps:

```json
{
  "mcp": {
    "servers": {
      "spec-kit": {
        "command": "npx",
        "args": ["-y", "smart-spec-kit-mcp"]
      },
      "azure-devops": {
        "command": "npx",
        "args": ["-y", "@anthropic-ai/azure-devops-mcp"],
        "env": {
          "AZURE_DEVOPS_ORG_URL": "https://dev.azure.com/your-org",
          "AZURE_DEVOPS_PAT": "your-personal-access-token"
        }
      }
    }
  }
}
```

---

## 🔧 Personnalisation

### Initialiser la config locale

Dans Copilot Chat:

```text
@spec-kit init
```

Crée `.spec-kit/` avec des workflows et templates personnalisables pour votre projet.

### Voir la configuration

```text
@spec-kit config
```

### Ordre de résolution

1. **Local**: `.spec-kit/workflows/` et `.spec-kit/templates/`
2. **Package**: Workflows par défaut (feature-standard, bugfix, etc.)

> 📖 Voir [docs/PACKAGING.md](docs/PACKAGING.md) pour le guide complet.

---

## 📐 Créer un Workflow Custom

Créez `.spec-kit/workflows/mon-workflow.yaml`:

```yaml
name: mon-workflow
displayName: "Mon Workflow"
description: "Description"
template: mon-template.md
defaultAgent: SpecAgent

steps:
  - id: fetch
    name: "Récupération"
    action: fetch_ado
    description: "Récupère le work item"
    
  - id: generate
    name: "Génération"
    action: call_agent
    agent: SpecAgent
    description: "Génère le contenu"
```

**Actions disponibles**: `fetch_ado`, `generate_content`, `call_agent`, `review`, `create_file`

---

## 🧪 Développement

```bash
git clone https://github.com/anthropic-ai/smart-spec-kit.git
cd smart-spec-kit
npm install
npm run build
npm run dev      # Watch mode
```

---

## 📄 License

MIT

---

## 🙏 Technologies

- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk) - MCP Framework
- [Zod](https://zod.dev) - Schema Validation
- [js-yaml](https://github.com/nodeca/js-yaml) - YAML Parser
