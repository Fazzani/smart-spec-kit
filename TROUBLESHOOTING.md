# 🆘 Troubleshooting Spec-Kit

## macOS: `command not found: smart-spec-kit-mcp`

Si vous recevez cette erreur sur macOS, essayez ces solutions:

### Solution 1: Mettre à jour npm (recommandé)

```bash
npm install -g npm@latest
```

Puis réessayez:
```bash
npx smart-spec-kit-mcp setup
```

### Solution 2: Installer globalement

```bash
npm install -g smart-spec-kit-mcp
smart-spec-kit-mcp setup
```

### Solution 3: Utiliser avec yarn

```bash
yarn dlx smart-spec-kit-mcp setup
```

### Solution 4: Utiliser pnpm

```bash
pnpm dlx smart-spec-kit-mcp setup
```

---

## VS Code: MCP Tools n'apparaissent pas

Si les outils Spec-Kit n'apparaissent pas dans Copilot Chat:

1. **Rechargez VS Code**: `Cmd+Shift+P` (macOS) ou `Ctrl+Shift+P` (Windows/Linux)
   - Tapez "Reload Window"
   - Pressez Entrée

2. **Vérifiez les permissions des profils**:
   ```bash
   # Sur macOS, vérifiez les droits d'accès au fichier de config
   ls -la ~/.config/Code/User/profiles/*/mcp.json
   # ou
   ls -la ~/Library/Application\ Support/Code/User/profiles/*/mcp.json
   ```

3. **Vérifiez la configuration MCP**:
   - Ouvrez "Output" panel: `Ctrl+Shift+U`
   - Sélectionnez "GitHub Copilot Log" 
   - Cherchez des erreurs liées à "spec-kit"

4. **Réinstallez la configuration**:
   ```bash
   npx smart-spec-kit-mcp setup
   ```

---

## Windows: Erreur lors du démarrage

Si vous avez une erreur lors du lancement du setup sur Windows:

1. **Assurez-vous que Node.js est installé**:
   ```powershell
   node --version
   npm --version
   ```

2. **Utilisez PowerShell en administrateur** (si permis)

3. **Vérifiez votre antivirus** - Certains antivirus bloquent l'exécution de scripts npm

---

## Problèmes de Performance

Si Spec-Kit est lent à démarrer:

1. **Vérifiez la connexion Internet** - npx télécharge les packages
2. **Utilisez `--skip-prompts`** pour une installation plus rapide:
   ```bash
   npx smart-spec-kit-mcp setup --skip-prompts
   ```

---

## Besoin d'aide?

Consultez la [documentation complète](docs/DOCUMENTATION.md) ou créez une issue sur GitHub.
