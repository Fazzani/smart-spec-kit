# 📋 AGENT IMPLEMENTATION ROADMAP

Tu es chargé de l'implémentation technique. Exécute les phases dans l'ordre.
Pour chaque étape marquée **[MANUAL INPUT]**, arrête-toi et demande confirmation ou credentials à l'utilisateur.

## 🗓 PHASE 1: Infrastructure & Core Server

- [ ] **1.1 Init Project Scaffolding**
    - Initialiser un projet Node.js/TypeScript.
    - Installer `@modelcontextprotocol/sdk`, `zod` (validation), `js-yaml`.
    - Configurer `tsconfig.json` (Target ES2022, Strict Mode).
    - Créer l'arborescence : `src/`, `workflows/`, `templates/`.

- [ ] **1.2 Create Spec-Kit MCP Server Entrypoint**
    - Créer `src/index.ts`.
    - Instancier un `McpServer`.
    - Configurer le transport `StdioServerTransport`.
    - Implémenter un tool de test "ping" pour vérifier que le serveur répond.

- [ ] **1.3 VS Code Configuration Generator**
    - Créer un script ou un fichier helper qui génère le JSON de config pour VS Code.
    - **Note:** Il doit inclure la config pour `spec-kit` (local) ET `azure-devops` (npx).
    - **[MANUAL INPUT]**: Demande à l'utilisateur son URL Azure DevOps Organization pour pré-remplir la config.

## 🧠 PHASE 2: The Workflow Engine

- [ ] **2.1 Implement Workflow Loader**
    - Créer `src/utils/workflowLoader.ts`.
    - Il doit lire les fichiers `.yaml` dans le dossier `/workflows`.
    - Il doit valider la structure avec Zod (Schema: name, steps, agent, template).

- [ ] **2.2 Implement "Start Workflow" Tool**
    - Créer le tool MCP `start_workflow`.
    - Input: `workflow_name` (string), `context_id` (string, ex: ticket ID).
    - Logic:
        1. Charger le YAML correspondant.
        2. Charger le template Markdown associé.
        3. Retourner un prompt structuré guidant Copilot pour la prochaine étape (ex: "Call ADO server to get item X").

- [ ] **2.3 Create "Feature Standard" Assets**
    - Créer `workflows/feature-standard.yaml` (Step 1: Fetch ADO, Step 2: Write Spec).
    - Créer `templates/functional-spec.md` (Frontmatter + Sections standards).

## 🛠 PHASE 3: Intelligence & Agents

- [ ] **3.1 System Prompts Library**
    - Créer `src/prompts/agents.ts`.
    - Définir les prompts constants pour : `SpecAgent`, `PlanAgent`, `GovAgent`.
    - Ces prompts doivent être injectables dans les réponses du serveur MCP.

- [ ] **3.2 Markdown Generator Helper**
    - Créer un utilitaire qui prend un Template + Data (JSON ADO) et retourne le Markdown rempli.
    - Attention : Ne pas tout automatiser, laisser des placeholders `[TO FILL]` pour l'IA générative.

## 🚀 PHASE 4: Final Polish

- [ ] **4.1 README & Documentation**
    - Générer un `README.md` complet expliquant comment installer le serveur dans `settings.json` de VS Code.