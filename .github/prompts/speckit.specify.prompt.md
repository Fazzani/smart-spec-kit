---
description: "Créer une spécification fonctionnelle à partir d'exigences ou d'une description de fonctionnalité"
mode: "agent"
tools: ["mcp_spec-kit_speckit_specify"]
---

# Spec-Kit: Créer une spécification

Vous utilisez **Spec-Kit** pour créer une spécification fonctionnelle structurée.

## Instructions

Appelez l'outil MCP `speckit_specify` avec les exigences fournies par l'utilisateur.

```
$ARGUMENTS
```

## Workflow

1. Analysez les exigences fournies
2. Appelez `speckit_specify` avec les exigences
3. Suivez les instructions retournées par l'outil pour générer la spécification
4. Suggérez la prochaine étape (`/speckit.plan` ou `/speckit.clarify`)

## Contexte du projet

Consultez `.spec-kit/memory/constitution.md` pour les principes du projet.
Utilisez `.spec-kit/templates/functional-spec.md` comme template.
Sauvegardez dans `specs/`.
