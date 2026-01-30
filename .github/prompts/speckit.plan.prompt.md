---
description: "Créer un plan d'implémentation technique à partir d'une spécification"
mode: "agent"
tools: ["mcp_spec-kit_speckit_plan"]
---

# Spec-Kit: Créer un plan d'implémentation

Vous utilisez **Spec-Kit** pour créer un plan d'implémentation technique.

## Instructions

Appelez l'outil MCP `speckit_plan` pour créer le plan.

```
$ARGUMENTS
```

## Workflow

1. Localisez la spécification la plus récente (ou celle fournie)
2. Appelez `speckit_plan` avec le chemin de la spec si fourni
3. Générez un plan d'implémentation détaillé
4. Suggérez la prochaine étape (`/speckit.tasks`)

## Contexte du projet

- Lisez la constitution du projet : `.spec-kit/memory/constitution.md`
- Utilisez le template : `.spec-kit/templates/plan-template.md`
- Basez-vous sur la spec dans `specs/`
