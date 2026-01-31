/**
 * Agent Loader
 * 
 * Loads agent definitions with local override support.
 * 
 * Resolution order:
 * 1. Local project: .spec-kit/agents/
 * 2. Package defaults: Built-in agents (src/prompts/agents.ts)
 * 
 * This allows any project to customize agents or create new ones.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import yaml from "js-yaml";
import { AgentRegistry, type AgentDefinition, type AgentType } from "../prompts/agents.js";

// Directory name for local agents
const AGENTS_DIR = "agents";
const LOCAL_CONFIG_DIR = ".spec-kit";

/**
 * Extended agent type that includes custom agents
 */
export type ExtendedAgentType = AgentType | string;

/**
 * Agent frontmatter parsed from Markdown files
 */
interface AgentFrontmatter {
  name: string;
  displayName: string;
  description: string;
  capabilities?: string[];
}

/**
 * Get the current working directory (user's project)
 */
function getProjectRoot(): string {
  return process.cwd();
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse a Markdown agent file with YAML frontmatter
 * 
 * Expected format:
 * ```
 * ---
 * name: MyAgent
 * displayName: "My Custom Agent"
 * description: "What this agent does"
 * capabilities:
 *   - Capability 1
 *   - Capability 2
 * ---
 * 
 * ## System Prompt
 * 
 * Your system prompt content here...
 * ```
 */
async function parseAgentFile(filePath: string): Promise<AgentDefinition | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    
    // Extract frontmatter (between --- markers)
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      console.warn(`Agent file ${filePath} has no valid frontmatter`);
      return null;
    }
    
    const frontmatterRaw = frontmatterMatch[1] ?? "";
    const systemPrompt = frontmatterMatch[2]?.trim() || "";
    
    // Parse YAML frontmatter
    const frontmatter = yaml.load(frontmatterRaw) as AgentFrontmatter;
    
    if (!frontmatter.name || !frontmatter.displayName || !frontmatter.description) {
      console.warn(`Agent file ${filePath} missing required fields (name, displayName, description)`);
      return null;
    }
    
    return {
      name: frontmatter.name as AgentType,
      displayName: frontmatter.displayName,
      description: frontmatter.description,
      capabilities: frontmatter.capabilities || [],
      systemPrompt: systemPrompt,
    };
  } catch (error) {
    console.warn(`Failed to parse agent file ${filePath}:`, error);
    return null;
  }
}

/**
 * Get the local agents directory path
 */
function getLocalAgentsDir(): string {
  return path.join(getProjectRoot(), LOCAL_CONFIG_DIR, AGENTS_DIR);
}

/**
 * List all local agent files
 */
async function listLocalAgentFiles(): Promise<string[]> {
  const agentsDir = getLocalAgentsDir();
  
  try {
    const files = await fs.readdir(agentsDir);
    return files.filter(f => f.endsWith(".md"));
  } catch {
    // Directory doesn't exist
    return [];
  }
}

/**
 * Load a single agent by name
 * 
 * Resolution order:
 * 1. Local override: .spec-kit/agents/{name}.md
 * 2. Built-in agent from AgentRegistry
 */
export async function loadAgent(name: ExtendedAgentType): Promise<AgentDefinition> {
  // 1. Try local override first
  const localPath = path.join(getLocalAgentsDir(), `${name}.md`);
  
  if (await fileExists(localPath)) {
    const localAgent = await parseAgentFile(localPath);
    if (localAgent) {
      return localAgent;
    }
  }
  
  // 2. Fall back to built-in agent
  const builtinAgent = AgentRegistry[name as AgentType];
  if (builtinAgent) {
    return builtinAgent;
  }
  
  // 3. Agent not found
  const available = await listAllAgents();
  throw new Error(
    `Agent "${name}" not found.\n` +
    `Available agents: ${available.map(a => a.name).join(", ") || "none"}\n\n` +
    `Tip: Create custom agents in .spec-kit/agents/${name}.md`
  );
}

/**
 * Get the system prompt for an agent
 */
export async function getAgentPrompt(name: ExtendedAgentType): Promise<string> {
  const agent = await loadAgent(name);
  return agent.systemPrompt;
}

/**
 * List all available agents (local + built-in)
 * Local agents override built-in agents with the same name
 */
export async function listAllAgents(): Promise<Array<{
  name: string;
  displayName: string;
  description: string;
  source: "local" | "builtin";
}>> {
  const results: Array<{
    name: string;
    displayName: string;
    description: string;
    source: "local" | "builtin";
  }> = [];
  
  const seen = new Set<string>();
  
  // 1. Load local agents first (they take priority)
  const localFiles = await listLocalAgentFiles();
  
  for (const file of localFiles) {
    const filePath = path.join(getLocalAgentsDir(), file);
    const agent = await parseAgentFile(filePath);
    
    if (agent && !seen.has(agent.name)) {
      seen.add(agent.name);
      results.push({
        name: agent.name,
        displayName: agent.displayName,
        description: agent.description,
        source: "local",
      });
    }
  }
  
  // 2. Add built-in agents (if not overridden)
  for (const [name, agent] of Object.entries(AgentRegistry)) {
    if (!seen.has(name)) {
      seen.add(name);
      results.push({
        name: agent.name,
        displayName: agent.displayName,
        description: agent.description,
        source: "builtin",
      });
    }
  }
  
  return results;
}

/**
 * List agents with full details (including capabilities)
 */
export async function listAgentsDetailed(): Promise<Array<{
  name: string;
  displayName: string;
  description: string;
  capabilities: string[];
  source: "local" | "builtin";
}>> {
  const results: Array<{
    name: string;
    displayName: string;
    description: string;
    capabilities: string[];
    source: "local" | "builtin";
  }> = [];
  
  const seen = new Set<string>();
  
  // 1. Load local agents first
  const localFiles = await listLocalAgentFiles();
  
  for (const file of localFiles) {
    const filePath = path.join(getLocalAgentsDir(), file);
    const agent = await parseAgentFile(filePath);
    
    if (agent && !seen.has(agent.name)) {
      seen.add(agent.name);
      results.push({
        name: agent.name,
        displayName: agent.displayName,
        description: agent.description,
        capabilities: agent.capabilities,
        source: "local",
      });
    }
  }
  
  // 2. Add built-in agents
  for (const [name, agent] of Object.entries(AgentRegistry)) {
    if (!seen.has(name)) {
      seen.add(name);
      results.push({
        name: agent.name,
        displayName: agent.displayName,
        description: agent.description,
        capabilities: agent.capabilities,
        source: "builtin",
      });
    }
  }
  
  return results;
}

/**
 * Check if an agent exists (local or built-in)
 */
export async function agentExists(name: string): Promise<boolean> {
  // Check local
  const localPath = path.join(getLocalAgentsDir(), `${name}.md`);
  if (await fileExists(localPath)) {
    return true;
  }
  
  // Check built-in
  return name in AgentRegistry;
}
