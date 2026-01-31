---
description: "Créer un plan d'implémentation technique avec documents de support"
mode: "agent"
tools: ["mcp_spec-kit_speckit_plan"]
---

# Spec-Kit: Créer un plan d'implémentation

Vous utilisez **Spec-Kit** pour créer un plan d'implémentation technique complet.

## Instructions

Appelez l'outil MCP `speckit_plan` pour créer le plan.

```
$ARGUMENTS
```

## Workflow

1. **Localisez** la spécification la plus récente (ou celle fournie)
2. **Validez Phase -1 Gates** (Simplicity, Anti-Abstraction, Integration-First, Test-First)
3. **Générez le plan principal** (`plan.md`)
4. **Générez les documents de support**:
   - `data-model.md` - Entités et relations (si applicable)
   - `contracts/api.yaml` - Contrat OpenAPI 3.0 (si applicable)
   - `contracts/events.md` - Événements temps réel (si applicable)
   - `quickstart.md` - Scénarios de validation manuelle
   - `research.md` - Recherche technique (optionnel, si décisions complexes)
5. **Suggérez** la prochaine étape (`/speckit.tasks`)

## Templates Disponibles

| Document | Template | Obligatoire |
|----------|----------|-------------|
| Plan principal | `plan-template.md` | ✅ |
| Modèle de données | `data-model.md` | Optionnel selon le projet |
| Contrat API | `contracts/api-template.yaml` | Optionnel selon le projet |
| Événements | `contracts/events-template.md` | Si temps réel |
| Quickstart | `quickstart.md` | ✅ |
| Recherche | `research.md` | Optionnel |

## Structure de Sortie

```
specs/[branch-name]/
├── spec.md           # Déjà créé
├── plan.md           # Plan principal
├── data-model.md     # Entités, relations, validation
├── quickstart.md     # Scénarios validation
├── research.md       # Recherche (optionnel)
└── contracts/
    ├── api.yaml      # OpenAPI 3.0
    └── events.md     # WebSocket/SSE (optionnel)
```

## Contexte du projet

- Lisez la constitution : `.spec-kit/memory/constitution.md`
- Utilisez les templates : `.spec-kit/templates/`
- Basez-vous sur la spec dans `specs/`
