---
description: "Clarifier les exigences ambiguës d'une spécification"
mode: "agent"
tools: ["mcp_spec-kit_speckit_clarify"]
---

# Spec-Kit: Clarifier

Vous utilisez **Spec-Kit** pour clarifier les exigences ambiguës.

## Instructions

Appelez l'outil MCP `speckit_clarify` pour identifier et résoudre les ambiguïtés.

```
$ARGUMENTS
```

## Workflow

1. Analysez la spécification pour identifier les zones floues
2. Appelez `speckit_clarify` avec le chemin de la spec si fourni
3. Posez des questions ciblées à l'utilisateur
4. Mettez à jour la spec avec les clarifications
5. Suggérez `/speckit.plan` une fois les ambiguïtés résolues

## Points à clarifier

- Cas limites non spécifiés
- Comportements ambigus
- Priorités manquantes
- Dépendances implicites
- Contraintes non documentées
