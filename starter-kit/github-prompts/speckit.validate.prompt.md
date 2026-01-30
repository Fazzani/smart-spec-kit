---
description: "Valider une spécification ou implémentation contre des règles (sécurité, RGPD, etc.)"
mode: "agent"
tools: ["mcp_spec-kit_speckit_validate"]
---

# Spec-Kit: Valider

Vous utilisez **Spec-Kit** pour valider la conformité d'une spec ou implémentation.

## Instructions

Appelez l'outil MCP `speckit_validate` pour effectuer la validation.

```
$ARGUMENTS
```

## Types de validation disponibles

- **security** : Règles de sécurité (`.spec-kit/rules/security-rules.md`)
- **rgpd** : Conformité RGPD (`.spec-kit/rules/rgpd-rules.md`)
- **custom** : Règles personnalisées dans `.spec-kit/rules/`

## Workflow

1. Identifiez le type de validation demandé
2. Chargez les règles appropriées
3. Appelez `speckit_validate` avec le type de règles
4. Générez un rapport de validation
5. Listez les non-conformités avec recommandations

## Rapport

Le rapport est sauvegardé dans `specs/validations/`.
