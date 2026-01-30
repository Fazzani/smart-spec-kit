# 🚀 Spec-Kit MCP Server

[![npm version](https://img.shields.io/npm/v/smart-spec-kit-mcp.svg)](https://www.npmjs.com/package/smart-spec-kit-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Plateforme d'orchestration automatisée pour le **développement piloté par les spécifications** (Spec-Driven Development) via **GitHub Copilot** et **MCP** (Model Context Protocol).

## ✨ Fonctionnalités

- **🤖 Commandes Naturelles**: Utilisez `speckit: spec`, `speckit: plan`, etc. directement dans Copilot Chat
- **📝 Prompts Versionnés**: Prompts personnalisables et versionnables dans `.spec-kit/prompts/`
- **🔄 Workflows YAML**: Processus personnalisables étape par étape
- **📋 Templates**: Spécifications fonctionnelles, plans d'implémentation, rapports de bugs
- **🛡️ Gouvernance Intégrée**: Constitution projet, principes de développement
- **🔗 Azure DevOps**: Intégration native via MCP
- **❓ Aide Contextuelle**: Demandez de l'aide sur Spec-Kit directement dans Copilot

---

## ⚡ Installation Rapide

### Option 1: Installation Automatique (Recommandé)

```bash
npx smart-spec-kit-mcp setup
```

Cette commande configure automatiquement:

- ✅ VS Code settings.json (MCP server)
- ✅ `.github/copilot-instructions.md` (guide Copilot)
- ✅ `.spec-kit/` avec prompts, templates et workflows

### Option 2: Configuration Manuelle

Ajoutez dans `.vscode/settings.json`:

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

Puis rechargez VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

---

## 📁 Structure du Projet

Après installation, votre projet contient:

```text
votre-projet/
├── .github/
│   └── copilot-instructions.md   # Guide Copilot sur l'utilisation de Spec-Kit
├── .spec-kit/
│   ├── prompts/                  # Prompts (lus par les outils MCP)
│   │   ├── specify.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── implement.md
│   │   ├── clarify.md
│   │   └── validate.md
│   ├── templates/                # Templates de documents
│   │   ├── functional-spec.md
│   │   ├── plan-template.md
│   │   └── tasks-template.md
│   ├── rules/                    # Règles de validation
│   │   ├── security-rules.md     # Règles de sécurité
│   │   └── rgpd-rules.md         # Conformité RGPD
│   ├── memory/                   # Contexte projet
│   │   └── constitution.md       # Principes du projet
│   └── workflows/                # Workflows automatisés
│       ├── feature-quick.yaml    # Quick wins (léger)
│       ├── feature-standard.yaml
│       ├── feature-full.yaml
│       └── bugfix.yaml
└── specs/                        # Spécifications générées
    └── validations/              # Rapports de validation
```

---

## 🎮 Commandes Disponibles

Utilisez ces phrases dans Copilot Chat pour déclencher les outils MCP:

| Commande | Alias | Description |
|----------|-------|-------------|
| `speckit: spec` | `speckit: specify`, `créer une spec` | Crée une spécification fonctionnelle |
| `speckit: plan` | `planifier`, `créer un plan` | Crée un plan d'implémentation |
| `speckit: tasks` | `générer les tâches` | Génère la liste des tâches |
| `speckit: implement` | `implémenter`, `coder` | Exécute les tâches |
| `speckit: clarify` | `clarifier`, `préciser` | Clarifie les requirements ambigus |
| `speckit: validate` | `valider`, `vérifier` | Valide la conformité (sécurité, RGPD, etc.) |
| `speckit: memory` | `enrichir la mémoire`, `ajouter au contexte` | Gère la mémoire projet |
| `speckit: help` | `aide sur speckit` | Obtient de l'aide sur Spec-Kit |

---

## 🚀 Workflow Recommandé

### 1. Établir les principes du projet

Éditez `.spec-kit/memory/constitution.md` avec vos principes de développement:

```markdown
# Constitution du Projet

## Stack Technique
- Frontend: React + TypeScript
- Backend: Node.js + Express
- Base de données: PostgreSQL

## Principes
- Clean Architecture
- Tests obligatoires
- Code review systématique
```

### 2. Créer une spécification

```text
speckit: spec pour un système de notifications push
```

### 3. Planifier l'implémentation

```text
speckit: plan
```

### 4. Générer les tâches

```text
speckit: tasks
```

### 5. Implémenter

```text
speckit: implement
```

---

## 🔧 Personnalisation

### Modifier les Prompts

Les prompts dans `.spec-kit/prompts/` définissent le comportement de chaque commande:

```markdown
# .spec-kit/prompts/specify.md

## Analyse Requirements
- Identifier les besoins utilisateur
- Lister les contraintes techniques
- Définir les critères d'acceptation
...
```

### Personnaliser les Templates

Modifiez les templates dans `.spec-kit/templates/` pour adapter le format de vos documents.

### Créer un Workflow Personnalisé

Créez un fichier YAML dans `.spec-kit/workflows/`:

```yaml
name: mon-workflow
displayName: "Mon Workflow Personnalisé"
description: "Description de ce que fait le workflow"
template: mon-template.md
defaultAgent: SpecAgent

steps:
  - id: analyze
    name: "Analyse"
    action: call_agent
    agent: SpecAgent
    description: "Analyse les requirements"
    
  - id: generate
    name: "Génération"
    action: call_agent
    agent: PlanAgent
    description: "Génère le plan"
```

---

## ❓ Obtenir de l'Aide

Demandez de l'aide directement dans Copilot Chat:

```text
speckit: help comment créer un nouveau workflow ?
```

```text
speckit: help comment personnaliser les templates ?
```

```text
speckit: help quels sont les agents disponibles ?
```

---

## 🔗 Intégration Azure DevOps

Pour récupérer automatiquement les work items:

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
          "AZURE_DEVOPS_PAT": "your-token"
        }
      }
    }
  }
}
```

Puis utilisez:

```text
speckit: spec pour le work item #12345
```

---

## 🤖 Agents IA

| Agent | Rôle | Utilisation |
|-------|------|-------------|
| **SpecAgent** | Rédacteur | Spécifications fonctionnelles |
| **PlanAgent** | Planificateur | Plans d'implémentation |
| **GovAgent** | Validateur | Conformité RGPD, Sécurité |
| **TestAgent** | Testeur | Stratégies de tests |

---

## 🧪 Développement

```bash
git clone https://github.com/anthropic-ai/smart-spec-kit.git
cd smart-spec-kit
npm install
npm run build
```

### Tester localement

```bash
node dist/cli.js setup --project ./mon-projet --dry-run
```

---

## 📄 License

MIT
