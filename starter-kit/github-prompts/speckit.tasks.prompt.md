---
description: "Générer une liste de tâches détaillée à partir du plan d'implémentation"
mode: "agent"
tools: ["mcp_spec-kit_speckit_tasks"]
---

# Spec-Kit: Générer les tâches

Vous utilisez **Spec-Kit** pour générer une liste de tâches atomiques et actionnables.

## Instructions

Appelez l'outil MCP `speckit_tasks` pour générer les tâches.

```
$ARGUMENTS
```

## Workflow

1. Localisez le plan d'implémentation le plus récent
2. Appelez `speckit_tasks` avec le chemin du plan si fourni
3. Générez une liste de tâches ordonnées avec dépendances
4. Suggérez la prochaine étape (`/speckit.implement`)

## Format des tâches

Chaque tâche doit inclure :
- ID unique (T001, T002, etc.)
- Description claire et actionnable
- Fichier(s) concerné(s)
- Dépendances éventuelles
- Critères d'acceptation

## Template

Utilisez `.spec-kit/templates/tasks-template.md` comme guide.
