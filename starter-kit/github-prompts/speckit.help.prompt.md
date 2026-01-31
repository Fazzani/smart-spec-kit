````prompt
---
description: "Afficher l'aide et les commandes Spec-Kit disponibles"
mode: "agent"
tools: ["mcp_spec-kit_speckit_help"]
---

# Spec-Kit: Aide

## Arguments utilisateur

```
$ARGUMENTS
```

## Instructions

Affiche l'aide Spec-Kit. Si un sujet est fourni, donne des détails sur ce sujet.

## 🚀 Commandes Slash Disponibles

| Commande | Description | Exemple |
|----------|-------------|---------|
| `/speckit.specify` | Créer une spécification | `/speckit.specify système de login` |
| `/speckit.plan` | Créer un plan d'implémentation | `/speckit.plan` |
| `/speckit.tasks` | Générer les tâches | `/speckit.tasks` |
| `/speckit.implement` | Implémenter les tâches | `/speckit.implement` ou `/speckit.implement task 3` |
| `/speckit.clarify` | Clarifier les exigences | `/speckit.clarify` |
| `/speckit.validate` | Valider conformité (sécurité, RGPD) | `/speckit.validate security` |
| `/speckit.memory` | Gérer la mémoire projet | `/speckit.memory list` |
| `/speckit.workflow` | Démarrer un workflow automatisé | `/speckit.workflow feature-standard` |
| `/speckit.help` | Cette aide | `/speckit.help workflows` |

## 📋 Workflows Automatisés

| Workflow | Description |
|----------|-------------|
| `feature-quick` | Rapide: spec → implement |
| `feature-standard` | Standard: spec → plan → tasks → implement |
| `feature-full` | Complet avec validations sécurité/RGPD |
| `bugfix` | Correction de bug |

**Usage:** `/speckit.workflow feature-standard Mon Feature`

## 🔄 Workflow Typique

```
specify → plan → tasks → implement
    ↑
  clarify (si nécessaire)
```

## 📁 Structure du Projet

```
.spec-kit/
├── prompts/      # Personnaliser les commandes
├── templates/    # Templates des documents
├── memory/       # Constitution projet
├── rules/        # Règles de validation
└── workflows/    # Workflows custom
specs/            # Specs générées
```

## 🎯 Sujets d'Aide

- **workflows** : Créer et personnaliser des workflows
- **templates** : Utiliser et modifier les templates
- **prompts** : Modifier le comportement des commandes
- **customization** : Personnalisation avancée
- **troubleshooting** : Résolution de problèmes

````
