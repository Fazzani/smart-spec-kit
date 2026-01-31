````prompt
---
description: "Gérer les workflows Spec-Kit (lister, démarrer, statut)"
mode: "agent"
tools: ["mcp_spec-kit_speckit_workflow", "mcp_spec-kit_start_workflow", "mcp_spec-kit_workflow_status"]
---

# Spec-Kit: Gestion des Workflows

Vous utilisez **Spec-Kit** pour gérer les workflows multi-étapes.

## Instructions

1. **Appeler l'outil MCP** `speckit_workflow` pour gérer les workflows
2. **Interpréter les arguments** fournis par l'utilisateur

```
$ARGUMENTS
```

## Actions disponibles

### Lister les workflows
```
action: "list"
```

Affiche tous les workflows disponibles (locaux et intégrés).

### Démarrer un workflow
```
action: "start"
workflow_name: "feature-standard"
context_id: "MonFeature"      # Optionnel
auto: false                    # Optionnel (true = automatique)
```

Démarre un workflow multi-étapes. Le workflow guide automatiquement à travers les étapes.

### Vérifier le statut
```
action: "status"
```

Affiche l'état du workflow actif (étape en cours, actions complétées).

## Workflows intégrés

| Workflow | Description |
|----------|-------------|
| `feature-quick` | Feature rapide (léger, sans breakdown de tâches) |
| `feature-standard` | Feature standard (spec → plan → tasks → implement) |
| `feature-full` | Feature complète avec validation et tests |
| `bugfix` | Correction de bug avec reproduction |

## Exemples d'utilisation

### Utilisateur : "speckit: workflow list"
→ Appeler `speckit_workflow` avec `action: "list"`

### Utilisateur : "speckit: workflow start feature-standard"
→ Appeler `speckit_workflow` avec `action: "start"`, `workflow_name: "feature-standard"`

### Utilisateur : "speckit: workflow start feature-full MyFeature auto"
→ Appeler `speckit_workflow` avec:
- `action: "start"`
- `workflow_name: "feature-full"`
- `context_id: "MyFeature"`
- `auto: true`

### Utilisateur : "speckit: workflow status"
→ Appeler `speckit_workflow` avec `action: "status"`

## Mode automatique

Par défaut, les workflows demandent une approbation à chaque étape. 

En mode automatique (`auto: true`), le workflow s'exécute sans interruption.

## Workflow typique

```
specify → plan → tasks → implement
    ↑
  clarify (si nécessaire)
```

Les workflows orchestrent ces commandes automatiquement.

````
