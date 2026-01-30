---
description: "Gérer la mémoire projet (décisions, conventions, apprentissages)"
mode: "agent"
tools: ["mcp_spec-kit_speckit_memory"]
---

# Spec-Kit: Mémoire projet

Vous utilisez **Spec-Kit** pour gérer la mémoire et le contexte du projet.

## Instructions

Appelez l'outil MCP `speckit_memory` pour gérer la mémoire.

```
$ARGUMENTS
```

## Actions disponibles

- **add** : Ajouter un nouveau fichier mémoire
- **update** : Mettre à jour un fichier existant
- **list** : Lister tous les fichiers mémoire
- **auto** : Auto-enrichir le contexte depuis la conversation

## Catégories

- `decisions` : Décisions techniques importantes
- `architecture` : Choix architecturaux
- `conventions` : Conventions de code et de nommage
- `learnings` : Apprentissages et retours d'expérience
- `context` : Contexte général du projet

## Structure

Les fichiers mémoire sont stockés dans `.spec-kit/memory/`.
