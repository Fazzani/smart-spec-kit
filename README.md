# 🚀 Spec-Kit MCP Server

[![npm version](https://img.shields.io/npm/v/smart-spec-kit-mcp.svg)](https://www.npmjs.com/package/smart-spec-kit-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Plateforme d'orchestration automatisée pour le **développement piloté par les spécifications** (Spec-Driven Development) via **GitHub Copilot** et **MCP** (Model Context Protocol).

---

## 📚 Table of Contents

- [✨ Fonctionnalités](#-fonctionnalités)
- [⚡ Installation Rapide](#-installation-rapide)
- [📁 Structure du Projet](#-structure-du-projet)
- [🎮 Commandes Disponibles](#-commandes-disponibles)
- [🚀 Workflow Recommandé](#-workflow-recommandé)
- [🔧 Personnalisation](#-personnalisation)
- [❓ Obtenir de l'Aide](#-obtenir-de-laide)
- [🔗 Intégration Azure DevOps](#-intégration-azure-devops)
- [�️ Troubleshooting](#-troubleshooting)
- [�📖 Documentation Complète](#-documentation-complète)
- [🧪 Développement](#-développement)
- [📄 License](#-license)

---

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
- ✅ Tous les profils VS Code (Windows, macOS, Linux)
- ✅ `.github/copilot-instructions.md` (guide Copilot)
- ✅ `.spec-kit/` avec prompts, templates et workflows

> **Note macOS**: Si vous avez une erreur `command not found`, assurez-vous que npm/npx est à jour: `npm install -g npm@latest`

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

### Structure interne du package Spec-Kit

```text
smart-spec-kit-mcp/
├── starter-kit/                  # Source unique de la configuration
│   ├── prompts/                  # Prompts MCP (specify, plan, implement, etc.)
│   │   ├── specify.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── implement.md
│   │   ├── clarify.md
│   │   ├── validate.md
│   │   └── memory.md
│   ├── templates/                # Templates de documents
│   │   ├── functional-spec.md
│   │   ├── bugfix-report.md
│   │   ├── plan-template.md
│   │   └── tasks-template.md
│   ├── workflows/                # Workflows YAML prédéfinis
│   │   ├── feature-quick.yaml    # 3-step (spécification rapide)
│   │   ├── feature-standard.yaml # 4-step (complet)
│   │   ├── feature-full.yaml     # 5-step (détaillé)
│   │   ├── bugfix-quick.yaml     # 2-step (bugfix rapide)
│   │   └── bugfix.yaml
│   ├── agents/                   # Agents IA customisables
│   │   ├── SpecAgent.md          # Rédacteur de spécifications
│   │   ├── PlanAgent.md          # Planificateur technique
│   │   ├── GovAgent.md           # Validateur gouvernance
│   │   ├── TestAgent.md          # Stratège de tests
│   │   └── _CustomAgent.template.md  # Template pour créer vos agents
│   ├── rules/                    # Règles de validation
│   │   ├── security-rules.md     # Règles OWASP
│   │   └── rgpd-rules.md         # Conformité GDPR
│   ├── memory/                   # Contexte projet
│   │   └── constitution.md       # Principes du projet
│   ├── github-prompts/           # Slash commands pour Copilot
│   │   └── speckit.*.prompt.md
│   └── copilot-instructions.md   # Guide Copilot
```

### Structure après installation dans votre projet

```text
votre-projet/
├── .github/
│   └── copilot-instructions.md   # Copié lors du setup
├── .spec-kit/                    # Configuration locale (personnalisations)
│   ├── prompts/                  # Override les prompts par défaut
│   ├── templates/                # Override les templates par défaut
│   ├── workflows/                # Vos workflows personnalisés
│   ├── agents/                   # Vos agents personnalisés ← NOUVEAU
│   ├── rules/                    # Vos règles de validation
│   └── memory/
│       └── constitution.md       # Principes de votre projet
└── specs/                        # Spécifications générées
    └── validations/              # Rapports de validation
```

**Note**: Les workflows, templates et agents par défaut viennent de `starter-kit/` du package. 
Vous pouvez personnaliser en créant des fichiers dans `.spec-kit/`.

---

## 🎮 Commandes Disponibles

### Slash Commands (Recommandé)

Tapez `/` dans Copilot Chat pour voir les slash commands disponibles:

| Slash Command | Description |
|---------------|-------------|
| `/speckit.specify` | Crée une spécification fonctionnelle |
| `/speckit.plan` | Crée un plan d'implémentation |
| `/speckit.tasks` | Génère la liste des tâches |
| `/speckit.implement` | Exécute les tâches |
| `/speckit.clarify` | Clarifie les requirements ambigus |
| `/speckit.validate` | Valide la conformité (sécurité, RGPD, etc.) |
| `/speckit.memory` | Gère la mémoire projet |
| `/speckit.help` | Obtient de l'aide sur Spec-Kit |

### Commandes par mots-clés (Alternative)

Vous pouvez aussi utiliser ces phrases dans Copilot Chat:

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
/speckit.specify pour un système de notifications push
```

Ou avec la commande par mots-clés:

```text
speckit: spec pour un système de notifications push
```

### 3. Planifier l'implémentation

```text
/speckit.plan
```

### 4. Générer les tâches

```text
/speckit.tasks
```

### 5. Implémenter

```text
/speckit.implement
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

#### À propos des "Agents"

⚠️ **Important** : Les agents Spec-Kit (SpecAgent, PlanAgent, GovAgent, TestAgent) **ne sont PAS** des agents GitHub Copilot.

Ce sont des **system prompts prédéfinis** qui guident le comportement de Copilot :

| Agent | Rôle | Fichier |
|-------|------|---------|
| **SpecAgent** | Rédacteur de spécifications | `SpecAgent.md` |
| **PlanAgent** | Planificateur technique | `PlanAgent.md` |
| **GovAgent** | Validateur de gouvernance | `GovAgent.md` |
| **TestAgent** | Stratège de tests | `TestAgent.md` |

Quand vous mettez `agent: SpecAgent` dans une étape, Spec-Kit envoie le system prompt de SpecAgent à Copilot.

#### Créer un Agent Personnalisé

Les agents sont maintenant **entièrement customisables** depuis `.spec-kit/agents/` :

```markdown
# .spec-kit/agents/SecurityAgent.md

---
name: SecurityAgent
displayName: "Security Review Agent"
description: "Expert en sécurité applicative"
capabilities:
  - Identifier les vulnérabilités
  - Recommander les bonnes pratiques
---

## System Prompt

Tu es SecurityAgent, un expert en sécurité applicative...
```

Puis utilisez dans vos workflows :

```yaml
steps:
  - id: security-review
    agent: SecurityAgent  # Votre agent custom !
    action: call_agent
```

Pour plus de détails : [Understanding Spec-Kit Agents](docs/DOCUMENTATION.md#understanding-spec-kit-agents)

#### Validation du Schéma de Workflow

Chaque workflow YAML est validé automatiquement contre un schéma Zod. Les champs obligatoires sont :
- `name` - Identifiant unique
- `displayName` - Nom visible
- `description` - Description
- `template` - Fichier template
- `steps` - Au moins une étape

Erreur si validation échoue :
```
Error: Invalid workflow "mon-workflow":
  - steps.0.action: Invalid enum value
  - name: Required
```

Pour plus de détails sur le schéma, voir [Workflow Validation Schema](docs/DOCUMENTATION.md#workflow-validation-schema).

---

## ❓ Obtenir de l'Aide

Demandez de l'aide directement dans Copilot Chat:

```text
/speckit.help comment créer un nouveau workflow ?
```

```text
/speckit.help comment personnaliser les templates ?
```

```text
/speckit.help quels sont les agents disponibles ?
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
        "args": [
        "-y",
        "@azure-devops/mcp",
        "your-org",
      ],
        "env": {
          "AZURE_DEVOPS_PAT": "your-token"
        }
      }
    }
  }
}
```

Puis utilisez:

```text
/speckit.specify pour le work item #12345
```

---

## �️ Troubleshooting

Pour résoudre les problèmes courants:

- **macOS**: `command not found: smart-spec-kit-mcp`
  - Essayez: `npm install -g npm@latest` puis `npx smart-spec-kit-mcp setup`
  - Consultez [TROUBLESHOOTING.md](TROUBLESHOOTING.md) pour plus de solutions

- **VS Code**: Les outils Spec-Kit n'apparaissent pas
  - Relancez VS Code (Ctrl+Shift+P → "Reload Window")
  - Consultez [TROUBLESHOOTING.md](TROUBLESHOOTING.md#vs-code-tools-not-appearing)

- **Autres problèmes**: Voir [TROUBLESHOOTING.md](TROUBLESHOOTING.md) complet

---

## 📖 Documentation Complète

Pour une documentation détaillée sur tous les outils et fonctionnalités:

- **[QUICK-START.md](QUICK-START.md)** - Guide de démarrage rapide (2 minutes)
- **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)** - Documentation complète des outils MCP et workflows
- **[docs/PACKAGING.md](docs/PACKAGING.md)** - Guide de packaging et distribution
- **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** - Contexte du projet Spec-Kit
- **[TODO.md](TODO.md)** - Tâches en cours et prévues
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Guide de dépannage complet

---

## 🧪 Développement

```bash
git clone https://github.com/fazzani/smart-spec-kit.git
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
