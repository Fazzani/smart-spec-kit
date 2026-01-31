---
description: "Initialiser Spec-Kit dans le projet (guidé ou auto)"
mode: "agent"
tools: ["init"]
---

# Spec-Kit: Initialisation

Vous utilisez **Spec-Kit** pour initialiser le projet avec une constitution et les fichiers de configuration.

## Instructions

Appelez l'outil MCP `init` pour initialiser Spec-Kit dans ce projet.

```
$ARGUMENTS
```

## Modes disponibles

- **Guidé** (`guided: true`): Questions/réponses interactives pour remplir la constitution
- **Auto** (`guided: false`): Détection automatique depuis les fichiers du projet

## Workflow

1. **Analysez l'entrée utilisateur** :
   - Si l'utilisateur mentionne "auto", "automatique", ou "detect" → appelez `init` avec `{ "guided": false }`
   - Si l'utilisateur mentionne "guidé", "guided", "questions", ou "interactif" → appelez `init` avec `{ "guided": true }` (sans answers)
   - Si l'utilisateur ne précise rien → appelez `init` sans paramètre (l'outil demandera le mode)

2. **En mode guidé (IMPORTANT)** :
   - Appelez `init` avec `{ "guided": true }` UNE SEULE FOIS
   - L'outil affiche les questions à l'utilisateur
   - **ARRÊTEZ-VOUS ICI** - NE FAITES RIEN D'AUTRE
   - **ATTENDEZ** que l'utilisateur vous donne SES réponses dans un nouveau message
   - NE PAS inventer ou auto-compléter les réponses vous-même
   - Quand l'utilisateur fournit ses réponses, ALORS appelez `init` avec `{ "guided": true, "answers": {...} }`

3. Une fois terminé, suggérez `/speckit.specify` pour créer une première spécification

**RÈGLE CRITIQUE** : En mode guidé, vous devez attendre la réponse de l'utilisateur. Ne faites jamais deux appels à `init` dans la même conversation sans réponse utilisateur entre les deux.

## Contexte du projet

L'outil détecte automatiquement la stack technique depuis `package.json`, `tsconfig.json`, etc.
Il pré-remplit `.spec-kit/memory/constitution.md` avec les informations détectées.
