# Constitution du Projet Spec-Kit

## 📋 Présentation

**Spec-Kit** est un serveur MCP (Model Context Protocol) qui fournit une solution de **Prompt-as-Code** pour le développement piloté par les spécifications. Il s'intègre à GitHub Copilot dans VS Code.

## 🎯 Mission

Permettre aux développeurs de créer des spécifications structurées, des plans d'implémentation et des tâches de manière automatisée et guidée, en utilisant l'IA comme copilote.

---

## 🛠️ Stack Technique

### Runtime
- **Language**: TypeScript (strict mode)
- **Target**: ES2022, ESM modules
- **Runtime**: Node.js 18+

### Dépendances Principales
- `@modelcontextprotocol/sdk` - SDK MCP officiel
- `zod` - Validation de schémas
- `yaml` - Parsing des workflows

### Outils de Build
- `tsc` - Compilation TypeScript
- `tsx` - Exécution dev avec hot reload

---

## 📁 Architecture

```
smart-spec-kit/
├── src/
│   ├── index.ts              # Point d'entrée MCP server
│   ├── cli.ts                # CLI setup
│   ├── engine/
│   │   ├── sessionManager.ts # Gestion des sessions workflow
│   │   └── workflowEngine.ts # Moteur d'exécution workflows
│   ├── tools/
│   │   ├── orchestrationTools.ts # Outils MCP workflows
│   │   └── promptTools.ts        # Outils MCP prompt-as-code
│   ├── prompts/
│   │   └── agents.ts         # Définitions des agents IA
│   └── utils/
│       ├── workflowLoader.ts
│       └── starterKitInstaller.ts
├── workflows/                # Workflows YAML par défaut
├── templates/                # Templates de documents
├── starter-kit/              # Kit d'installation utilisateur
│   ├── prompts/              # Prompts par défaut
│   ├── templates/            # Templates par défaut
│   ├── memory/               # Constitution par défaut
│   └── copilot-instructions.md
└── docs/                     # Documentation
```

---

## 📐 Principes de Développement

### 1. Clean Code
- Fonctions courtes et focalisées (max 50 lignes)
- Nommage explicite en anglais
- Commentaires uniquement pour le "pourquoi", pas le "quoi"

### 2. Type Safety
- TypeScript strict mode obligatoire
- Pas de `any` sauf cas exceptionnels documentés
- Zod pour la validation runtime

### 3. Error Handling
- Toujours retourner des résultats typés
- Messages d'erreur clairs et actionnables
- Logging sur stderr (stdout réservé au protocole MCP)

### 4. Backward Compatibility
- Les outils MCP existants ne doivent pas changer de signature
- Nouvelles features = nouveaux outils ou paramètres optionnels

---

## 🔧 Conventions de Code

### Fichiers
- `kebab-case.ts` pour les fichiers
- Un fichier = une responsabilité

### Imports
```typescript
// 1. Node.js built-ins
import * as fs from "node:fs/promises";
import * as path from "node:path";

// 2. External packages
import { z } from "zod";

// 3. Local imports
import { sessionStore } from "./engine/sessionManager.js";
```

### Types
```typescript
// Préférer les interfaces pour les objets
interface WorkflowStep {
  id: string;
  name: string;
  action: string;
}

// Utiliser Zod pour la validation
const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  action: z.string(),
});
```

### MCP Tools
```typescript
server.tool(
  "tool_name",           // snake_case
  "Description claire",  // En français ou anglais
  SchemaShape,           // Zod schema .shape
  async (args) => {
    // Implementation
    return {
      content: [{
        type: "text" as const,
        text: "Result",
      }],
    };
  }
);
```

---

## 🧪 Tests

### Manuels (actuellement)
```bash
npm run build
node dist/cli.js setup --project ./test-project --dry-run
```

### À implémenter
- [ ] Tests unitaires avec Vitest
- [ ] Tests d'intégration MCP
- [ ] Tests E2E avec projet exemple

---

## 📦 Publication

### Checklist avant publication
1. `npm run build` sans erreurs
2. Tester `setup --dry-run`
3. Vérifier `package.json` version
4. Tester les outils MCP manuellement

### Commandes
```bash
npm version patch|minor|major
npm publish
```

---

## 🚫 Interdictions

- **Jamais** de secrets dans le code
- **Jamais** de console.log (utiliser console.error pour debug)
- **Jamais** modifier stdout (réservé au protocole MCP)
- **Jamais** de dépendances sans justification

---

## 📚 Ressources

- [MCP Specification](https://modelcontextprotocol.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Zod Documentation](https://zod.dev/)
