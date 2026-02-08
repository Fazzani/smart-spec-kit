# 📦 Guide de Packaging et Distribution

Ce guide explique comment Spec-Kit est conçu pour être utilisé dans n'importe quel projet.

---

## 🎯 Principe: Zero Config + Override Local

Spec-Kit fonctionne **immédiatement** avec les workflows par défaut, mais permet aux équipes de **personnaliser** pour leur stack.

```text
┌─────────────────────────────────────────────────────────────┐
│  Votre Projet                                               │
│  ├── .spec-kit/          ← Overrides locaux (optionnel)     │
│  │   ├── workflows/                                         │
│  │   │   └── react-feature.yaml   ← Votre workflow custom   │
│  │   └── templates/                                         │
│  │       └── react-spec.md        ← Votre template custom   │
│  └── src/                                                   │
│      └── ...                                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ utilise
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Package spec-kit-mcp (npm)                                 │
│  ├── workflows/          ← Workflows par défaut             │
│  │   ├── feature-standard.yaml                              │
│  │   ├── feature-full.yaml                                  │
│  │   └── bugfix.yaml                                        │
│  └── templates/          ← Templates par défaut             │
│      ├── functional-spec.md                                 │
│      └── bugfix-report.md                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📥 Installation pour l'Utilisateur Final

### Option 1: Setup Automatique (Recommandé)

```bash
npx smart-spec-kit-mcp setup
```

Configure automatiquement:
- VS Code MCP server (profils et settings)
- Slash commands (`.github/prompts/speckit.*.prompt.md`)
- Agents natifs VS Code (`.github/agents/*.agent.md`) - VS Code 1.109+
- Agent skills (`.github/skills/*/SKILL.md`) - VS Code 1.109+
- Prompts, templates, workflows dans `.spec-kit/`
- Copilot Memory et agent/skill locations dans settings

### Option 2: NPX Direct

Configuration manuelle dans VS Code settings:

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

### Option 3: Installation Globale

```bash
npm install -g smart-spec-kit-mcp
```

```json
{
  "mcp": {
    "servers": {
      "spec-kit": {
        "command": "smart-spec-kit-mcp"
      }
    }
  }
}
```

---

## 🔧 Personnalisation par Projet

### Initialiser la config locale

Dans Copilot Chat:

```text
speckit: init
```

Ou via la CLI:

```bash
npx smart-spec-kit-mcp setup
```

Cela crée:

```text
.spec-kit/
├── workflows/
│   └── custom-feature.yaml  ← Exemple modifiable
└── templates/
    └── custom-spec.md       ← Exemple modifiable
```

### Ordre de résolution

Quand vous appelez `start_workflow workflow_name="X"`:

1. **D'abord**: `.spec-kit/workflows/X.yaml` (local)
2. **Ensuite**: `workflows/X.yaml` (dans le projet)
3. **Enfin**: Package defaults (feature-standard, etc.)

> Le **premier trouvé gagne** - vous pouvez override les workflows par défaut!

---

## 📝 Créer un Workflow pour votre Stack

### Exemple: React + TypeScript

`.spec-kit/workflows/react-feature.yaml`:

```yaml
name: react-feature
displayName: "React Feature Specification"
description: "Workflow adapté pour les features React/TypeScript"
template: react-spec.md
defaultAgent: SpecAgent

steps:
  - id: fetch-requirements
    name: "Fetch Requirements"
    action: fetch_ado
    description: "Récupère la User Story depuis Azure DevOps"
    outputs:
      - user_story

  - id: generate-spec
    name: "Generate Specification"
    action: call_agent
    agent: SpecAgent
    description: |
      Génère une spécification React avec:
      - Structure des composants
      - Props/State attendus
      - Hooks nécessaires
    inputs:
      source: user_story

  - id: component-plan
    name: "Component Architecture"
    action: call_agent
    agent: PlanAgent
    description: |
      Planifie l'architecture des composants:
      - Découpage en composants atomiques
      - Shared state (Context/Redux)
      - API calls (React Query)
    inputs:
      source: user_story

  - id: review
    name: "Technical Review"
    action: review
    agent: GovAgent
    description: |
      Valide les aspects techniques:
      - Performance (memo, useMemo, useCallback)
      - Accessibilité (ARIA, semantic HTML)
      - Tests (Jest, Testing Library)

  - id: create-output
    name: "Create Output"
    action: create_file
    description: "Crée le fichier de spécification"
    inputs:
      filename: "specs/{contextId}-react-spec.md"
```

### Template associé

`.spec-kit/templates/react-spec.md`:

```markdown
# {{title}} - React Specification

## Context
- **Work Item**: {{contextId}}
- **Date**: {{date}}
- **Stack**: React 18 + TypeScript

## User Story
{{description}}

## Component Architecture

### Components Tree
<!-- À remplir par SpecAgent -->

### Props & State
<!-- À remplir par SpecAgent -->

## Technical Considerations

### Performance
- [ ] Lazy loading si nécessaire
- [ ] Memoization des composants lourds
- [ ] Optimistic updates pour l'UX

### Accessibility
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader support

### Testing
- [ ] Unit tests (Jest)
- [ ] Component tests (Testing Library)
- [ ] E2E si applicable (Playwright)

## Tasks
<!-- À remplir par PlanAgent -->
```

---

## 🚀 Publication sur NPM

### Prérequis

1. Compte npm
2. `npm login`

### Publish

```bash
npm run build
npm publish
```

### Le package inclut

Défini dans `package.json`:

```json
{
  "files": [
    "dist",
    "workflows",
    "templates",
    "README.md"
  ]
}
```

---

## 🏗️ Architecture pour Maintainers

### Structure du package publié

```text
smart-spec-kit-mcp/
├── dist/                    ← Code compilé
│   ├── index.js            ← Entry point MCP
│   ├── cli.js              ← CLI pour setup
│   ├── engine/
│   ├── tools/
│   ├── prompts/
│   ├── schemas/
│   └── utils/
├── starter-kit/             ← Installé par setup
│   ├── github-prompts/     ← Slash commands VS Code
│   ├── github-agents/      ← 🆕 Agents natifs VS Code (.agent.md)
│   ├── github-skills/      ← 🆕 Compétences agents (SKILL.md)
│   ├── prompts/            ← Prompts MCP
│   ├── templates/          ← Templates de specs
│   ├── agents/             ← Agents system prompts
│   ├── rules/              ← Règles de validation
│   ├── memory/             ← Constitution projet
│   └── workflows/          ← Workflows par défaut
├── workflows/               ← Workflows package
│   ├── feature-standard.yaml
│   ├── feature-full.yaml
│   ├── feature-quick.yaml
│   ├── bugfix.yaml
│   └── bugfix-quick.yaml
├── templates/               ← Templates package
│   ├── functional-spec.md
│   └── bugfix-report.md
├── package.json
└── README.md
```

### Résolution des chemins

Le `workflowLoader.ts` gère la résolution:

```typescript
// Ordre de recherche
const searchPaths = [
  // 1. Local override
  path.join(process.cwd(), ".spec-kit", "workflows"),
  // 2. Project root (pour projets dédiés)
  path.join(process.cwd(), "workflows"),
  // 3. Package defaults
  path.join(__dirname, "..", "..", "workflows"),
];
```

---

## 📊 Commandes de Debug

### Voir la configuration actuelle

Dans Copilot Chat:

```text
speckit: show_config
```

Ou via l'outil MCP `show_config`.

Affiche:
- Chemins de recherche
- Workflows disponibles (local vs package)
- Projet courant vs package

### Tester un workflow custom

Utilisez la slash command ou l'outil MCP:

```text
# Slash command
/speckit.specify avec workflow custom-feature pour TEST-123

# Keyword
speckit: start_workflow workflow_name="custom-feature" context_id="TEST"
```

---

## 🎁 Stacks Pré-configurées (Roadmap)

Future versions pourraient inclure des presets:

```bash
npx smart-spec-kit-mcp setup --preset=react
npx smart-spec-kit-mcp setup --preset=dotnet
npx smart-spec-kit-mcp setup --preset=python
```

Chaque preset créerait `.spec-kit/` avec des workflows optimisés pour la stack.
