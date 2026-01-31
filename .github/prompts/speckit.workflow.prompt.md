````prompt
---
description: "Démarrer un workflow Spec-Kit automatisé"
mode: "agent"
tools: ["mcp_spec-kit_start_workflow", "mcp_spec-kit_workflow_status", "mcp_spec-kit_abort_workflow"]
---

# Spec-Kit: Workflows

Démarre un workflow automatisé multi-étapes.

## Arguments utilisateur

```
$ARGUMENTS
```

## Comment interpréter

1. **Si l'utilisateur donne un nom de workflow** → Démarrer ce workflow avec `start_workflow`
2. **Si l'utilisateur dit "list"** → Lister les workflows disponibles
3. **Si l'utilisateur dit "status"** → Vérifier le statut avec `workflow_status`
4. **Si l'utilisateur dit "stop" ou "abort"** → Annuler avec `abort_workflow`

## Workflows disponibles

| Nom | Description |
|-----|-------------|
| `feature-quick` | Quick win (spec → implement) |
| `feature-standard` | Standard (spec → plan → tasks → implement) |
| `feature-full` | Avec validations sécurité/RGPD |
| `bugfix` | Correction de bug |

## Exemples

- `/speckit.workflow feature-standard Multi-View` → `start_workflow` avec `workflow_name="feature-standard"`, `context_id="Multi-View"`
- `/speckit.workflow list` → Afficher la liste des workflows
- `/speckit.workflow status` → Vérifier le statut

## Simplification

Si l'utilisateur tape juste un nom de workflow sans "start":
- `/speckit.workflow feature-standard` → Démarrer feature-standard
- `/speckit.workflow bugfix` → Démarrer bugfix

Le texte après le nom du workflow devient le `context_id`.

````
