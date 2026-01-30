# TODO List

## Completed

- [x] Starter kit avec des workflows et templates par défaut et le setup MCP dans vscode
- [x] Prompts-as-Code via MCP tools (speckit_specify, speckit_plan, speckit_tasks, speckit_implement, speckit_clarify)
- [x] `.github/copilot-instructions.md` pour guider Copilot sur l'utilisation des outils spec-kit
- [x] Prompts installés dans `.spec-kit/prompts/` (lus par les outils MCP)
- [x] Slash commands VS Code Copilot (`/speckit.specify`, `/speckit.plan`, etc.)
- [x] CLI `setup` pour installation automatique
- [x] Tool `speckit_memory` pour gestion du contexte projet
- [x] Tool `speckit_validate` pour validation sécurité/RGPD
- [x] Tool `speckit_help` pour aide et documentation

## TODO

- [ ] Corriger le linter
- [ ] Automatiser la création des branches Git pour les tasks implémentées
- [ ] Ajouter tests unitaires pour starterKitInstaller
- [ ] Améliorer l'intégration Azure DevOps
- [ ] Tests d'intégration pour les outils MCP
- [ ] Presets par stack (`--preset=react`, `--preset=dotnet`, etc.)
- [ ] Ajouter la commande /spec-kit init qui initialise le starter kit dans un projet existant en guidant l'utilisateur avec des questions afin de personnaliser l'installation (choix des workflows, templates, règles de validation, etc.)
