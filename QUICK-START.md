# 🚀 QUICK-START: Spec-Kit

Démarrez en 2 minutes avec Spec-Kit.

---

## ⚡ Installation Express (1 commande!)

```bash
npx smart-spec-kit-mcp setup
```

C'est tout ! Cette commande configure automatiquement:
- ✅ VS Code settings.json (MCP server)
- ✅ `.github/copilot-instructions.md` (guide Copilot)
- ✅ `.spec-kit/` avec prompts, templates et workflows

Puis rechargez VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

---

## 🔍 Mode dry-run (prévisualisation)

Pour voir ce qui sera modifié sans rien changer:

```bash
npx smart-spec-kit-mcp setup --dry-run
```

---

## 🎮 Commandes Disponibles

Utilisez ces phrases dans **Copilot Chat**:

| Commande | Description |
|----------|-------------|
| `speckit: spec` | Crée une spécification fonctionnelle |
| `speckit: plan` | Crée un plan d'implémentation |
| `speckit: tasks` | Génère la liste des tâches |
| `speckit: implement` | Exécute les tâches d'implémentation |
| `speckit: clarify` | Clarifie les requirements ambigus |
| `speckit: memory` | Gère la mémoire projet (décisions, conventions...) |
| `speckit: help` | Obtient de l'aide sur Spec-Kit |

---

## 📋 Exemple Complet

### 1. Créer une spécification

Dans Copilot Chat:

```text
speckit: spec pour un système d'authentification avec email/password
```

### 2. Planifier l'implémentation

```text
speckit: plan
```

### 3. Générer les tâches

```text
speckit: tasks
```

### 4. Implémenter

```text
speckit: implement
```

---

## 🔧 Personnalisation

### Éditer la constitution du projet

Le fichier `.spec-kit/memory/constitution.md` définit vos principes:

```markdown
# Constitution du Projet

## Stack Technique
- Frontend: React + TypeScript
- Backend: Node.js + Express

## Principes
- Clean Architecture
- Tests obligatoires
```

### Modifier les prompts

Les fichiers dans `.spec-kit/prompts/` contrôlent le comportement de chaque commande.

### Adapter les templates

Les templates dans `.spec-kit/templates/` définissent le format des documents générés.

---

## ❓ Besoin d'aide ?

Demandez à Copilot:

```text
speckit: help comment créer un workflow personnalisé ?
```

```text
speckit: help quels sont les templates disponibles ?
```

---

## 📚 Structure du Projet

Après installation:

```text
.github/
└── copilot-instructions.md   # Guide Copilot
.spec-kit/
├── prompts/                  # Prompts versionnables
├── templates/                # Templates de documents
├── memory/                   # Constitution projet
└── workflows/                # Workflows YAML
specs/                        # Spécifications générées
```

---

## ⚠️ Dépannage

### Les commandes ne fonctionnent pas

1. Vérifiez que le MCP server est configuré dans VS Code settings
2. Rechargez VS Code (`Ctrl+Shift+P` → "Developer: Reload Window")
3. Testez avec `speckit: help`

### Le serveur ne répond pas

1. Vérifiez `.vscode/settings.json`:

    ```json
    {
    "mcp": {
        "servers": {
        "spec-kit": {
            "command": "npx",
            "args": ["-y", "smart-spec-kit-mcp"]
        }
        }
    }
    }
    ```

2. Rechargez VS Code (`Ctrl+Shift+P` → "Developer: Reload Window")

---

*Spec-Kit v2.0 - Commandes Spec-Driven pour GitHub Copilot* 🚀
