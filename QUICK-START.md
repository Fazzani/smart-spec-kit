# 🚀 QUICK-START: Spec-Kit

Démarrez en 2 minutes avec l'orchestration automatisée de spécifications.

---

## ⚡ Installation Express

### Étape 1: Configurer VS Code

Ouvrez les settings JSON: `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"

Ajoutez:

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

### Étape 2: Recharger VS Code

`Ctrl+Shift+P` → "Developer: Reload Window"

### Étape 3: Vérifier

Dans Copilot Chat:

```text
Utilise le tool ping de spec-kit
```

✅ Si vous voyez "pong", c'est prêt!

---

## 🎮 Commandes Disponibles

| Commande          | Description                       |
| ----------------- | --------------------------------- |
| `start_workflow`  | Démarre un workflow automatisé    |
| `execute_step`    | Continue à l'étape suivante       |
| `workflow_status` | Affiche le statut actuel          |
| `list_workflows`  | Liste les workflows disponibles   |
| `abort_workflow`  | Annule le workflow en cours       |
| `init`            | Crée la config locale du projet   |
| `config`          | Affiche la configuration actuelle |
| `ping`            | Vérifie que le serveur fonctionne |

---

## 📋 Démarrer un Workflow

### Feature Specification

```text
@spec-kit start_workflow workflow_name="feature-standard" context_id="12345"
```

Le serveur prend le contrôle et guide Copilot automatiquement:

1. **Récupère** le work item depuis Azure DevOps
2. **Génère** la spécification avec SpecAgent
3. **Planifie** les tâches avec PlanAgent
4. **Valide** avec GovAgent
5. **Crée** le fichier de sortie

> À chaque étape, validez avec "OK" pour continuer.

### Bugfix

```text
@spec-kit start_workflow workflow_name="bugfix" context_id="5678"
```

### Feature avec Gouvernance Complète

```text
@spec-kit start_workflow workflow_name="feature-full" context_id="9999"
```

10 étapes avec validations: RGPD, Sécurité, Architecture, Design System, Tests...

---

## 🔧 Personnaliser pour votre Projet

### Initialiser la config locale

```text
@spec-kit init
```

Crée dans votre projet:

```text
.spec-kit/
├── workflows/
│   └── custom-feature.yaml  ← Votre workflow personnalisé
└── templates/
    └── custom-spec.md       ← Votre template personnalisé
```

### Voir la configuration

```text
@spec-kit config
```

---

## 🔗 Ajouter Azure DevOps (optionnel)

Pour récupérer automatiquement les work items, ajoutez dans `settings.json`:

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
          "AZURE_DEVOPS_ORG_URL": "https://dev.azure.com/votre-org",
          "AZURE_DEVOPS_PAT": "votre-token"
        }
      }
    }
  }
}
```

---

## 📐 Créer un Workflow Custom

Créez `.spec-kit/workflows/mon-workflow.yaml`:

```yaml
name: mon-workflow
displayName: "Mon Workflow Custom"
description: "Description du workflow"
template: mon-template.md
defaultAgent: SpecAgent

steps:
  - id: step-1
    name: "Première étape"
    action: fetch_ado
    description: "Récupère les données"
    outputs:
      - workitem_data

  - id: step-2
    name: "Génération"
    action: call_agent
    agent: SpecAgent
    description: "Génère le contenu"
    inputs:
      source: "workitem_data"
```

### Actions Disponibles

| Action             | Description                          |
| ------------------ | ------------------------------------ |
| `fetch_ado`        | Récupère données depuis Azure DevOps |
| `generate_content` | Génère du contenu avec un agent      |
| `call_agent`       | Invoque un agent spécifique          |
| `review`           | Validation/review avec GovAgent      |
| `create_file`      | Crée un fichier de sortie            |

---

## ⚠️ Dépannage

### Workflow bloqué

```text
@spec-kit workflow_status
@spec-kit execute_step
```

### Réinitialiser

```text
@spec-kit abort_workflow
@spec-kit start_workflow workflow_name="feature-standard" context_id="12345"
```

### Le serveur ne répond pas

1. Vérifiez la config dans `settings.json`
2. Rechargez VS Code
3. Testez avec `@spec-kit ping`

---

## 📚 Référence Rapide

```bash
# Feature simple
start_workflow workflow_name="feature-standard" context_id="12345"

# Feature complète avec gouvernance
start_workflow workflow_name="feature-full" context_id="12345"

# Bugfix
start_workflow workflow_name="bugfix" context_id="12345"

# Initialiser config locale
init

# Voir config
config
```

---

*Spec-Kit v2.0 - Orchestration Automatisée pour GitHub Copilot* 🚀
