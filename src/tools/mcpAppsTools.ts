/**
 * MCP Apps Tools
 * 
 * Provides rich interactive UI components via the MCP Apps protocol.
 * These tools render interactive dashboards, traceability matrices,
 * and workflow progress visualizations directly in VS Code chat.
 * 
 * @see https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Generate an HTML dashboard for workflow progress
 */
function generateWorkflowDashboardHtml(
  featureName: string,
  steps: Array<{ name: string; status: "done" | "active" | "pending"; artifact?: string }>,
  stats: { requirements: number; tasks: number; coverage: number; issues: number }
): string {
  const stepsHtml = steps.map((step, i) => {
    const icon = step.status === "done" ? "✅" : step.status === "active" ? "🔄" : "⬜";
    const cls = step.status;
    const artifact = step.artifact ? `<span class="artifact">${step.artifact}</span>` : "";
    return `<div class="step ${cls}"><span class="step-num">${i + 1}</span><span class="icon">${icon}</span><span class="label">${step.name}</span>${artifact}</div>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  :root { --bg: #1e1e1e; --fg: #d4d4d4; --accent: #569cd6; --done: #4ec9b0; --active: #dcdcaa; --pending: #808080; --card-bg: #252526; --border: #3c3c3c; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--fg); margin: 0; padding: 16px; }
  h1 { color: var(--accent); font-size: 18px; margin: 0 0 16px 0; }
  .dashboard { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px; }
  .card h2 { font-size: 13px; color: var(--accent); margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px; }
  .steps { display: flex; flex-direction: column; gap: 6px; }
  .step { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 4px; font-size: 13px; }
  .step.done { background: rgba(78, 201, 176, 0.1); }
  .step.active { background: rgba(220, 220, 170, 0.15); border: 1px solid var(--active); }
  .step.pending { opacity: 0.5; }
  .step-num { width: 20px; height: 20px; border-radius: 50%; background: var(--border); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; }
  .step.done .step-num { background: var(--done); color: var(--bg); }
  .step.active .step-num { background: var(--active); color: var(--bg); }
  .artifact { font-size: 11px; color: var(--accent); margin-left: auto; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat { text-align: center; padding: 8px; background: rgba(86, 156, 214, 0.08); border-radius: 6px; }
  .stat-value { font-size: 24px; font-weight: bold; color: var(--accent); }
  .stat-label { font-size: 11px; color: var(--pending); margin-top: 2px; }
  .coverage-bar { height: 6px; border-radius: 3px; background: var(--border); overflow: hidden; margin-top: 8px; }
  .coverage-fill { height: 100%; background: linear-gradient(90deg, var(--done), var(--accent)); border-radius: 3px; transition: width 0.3s; }
</style>
</head>
<body>
<h1>📋 ${featureName} — Workflow Dashboard</h1>
<div class="dashboard">
  <div class="card" style="grid-column: span 2;">
    <h2>Workflow Progress</h2>
    <div class="steps">${stepsHtml}</div>
  </div>
  <div class="card">
    <h2>Coverage</h2>
    <div class="stats">
      <div class="stat"><div class="stat-value">${stats.requirements}</div><div class="stat-label">Requirements</div></div>
      <div class="stat"><div class="stat-value">${stats.tasks}</div><div class="stat-label">Tasks</div></div>
    </div>
    <div class="coverage-bar"><div class="coverage-fill" style="width: ${stats.coverage}%"></div></div>
    <div style="text-align: center; font-size: 12px; margin-top: 4px; color: var(--done);">${stats.coverage}% requirement coverage</div>
  </div>
  <div class="card">
    <h2>Quality</h2>
    <div class="stats">
      <div class="stat"><div class="stat-value">${stats.issues}</div><div class="stat-label">Open Issues</div></div>
      <div class="stat"><div class="stat-value">${stats.coverage >= 80 ? "✅" : "⚠️"}</div><div class="stat-label">Status</div></div>
    </div>
  </div>
</div>
</body>
</html>`;
}

/**
 * Generate a traceability matrix HTML view
 */
function generateTraceabilityHtml(
  featureName: string,
  matrix: Array<{ req: string; description: string; tasks: string[]; status: string }>
): string {
  const rows = matrix.map(row => {
    const statusIcon = row.status === "covered" ? "✅" : row.status === "partial" ? "⚠️" : "❌";
    return `<tr>
      <td class="req-id">${row.req}</td>
      <td>${row.description}</td>
      <td>${row.tasks.length > 0 ? row.tasks.join(", ") : "<em>None</em>"}</td>
      <td class="status">${statusIcon} ${row.status}</td>
    </tr>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  :root { --bg: #1e1e1e; --fg: #d4d4d4; --accent: #569cd6; --done: #4ec9b0; --warn: #dcdcaa; --err: #f44747; --card-bg: #252526; --border: #3c3c3c; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--fg); margin: 0; padding: 16px; }
  h1 { color: var(--accent); font-size: 18px; margin: 0 0 16px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: var(--card-bg); color: var(--accent); padding: 8px 12px; text-align: left; border-bottom: 2px solid var(--border); text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
  td { padding: 8px 12px; border-bottom: 1px solid var(--border); }
  tr:hover td { background: rgba(86, 156, 214, 0.05); }
  .req-id { font-weight: bold; color: var(--accent); white-space: nowrap; }
  .status { white-space: nowrap; }
  .summary { display: flex; gap: 16px; margin-bottom: 12px; font-size: 13px; }
  .summary-item { padding: 4px 10px; border-radius: 4px; }
  .summary-item.covered { background: rgba(78, 201, 176, 0.15); color: var(--done); }
  .summary-item.partial { background: rgba(220, 220, 170, 0.15); color: var(--warn); }
  .summary-item.uncovered { background: rgba(244, 71, 71, 0.15); color: var(--err); }
</style>
</head>
<body>
<h1>🔗 ${featureName} — Traceability Matrix</h1>
<div class="summary">
  <div class="summary-item covered">✅ ${matrix.filter(r => r.status === "covered").length} Covered</div>
  <div class="summary-item partial">⚠️ ${matrix.filter(r => r.status === "partial").length} Partial</div>
  <div class="summary-item uncovered">❌ ${matrix.filter(r => r.status === "uncovered").length} Uncovered</div>
</div>
<table>
  <thead><tr><th>Req ID</th><th>Description</th><th>Tasks</th><th>Status</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
</body>
</html>`;
}

/**
 * Parse specification to extract requirements
 */
function parseRequirements(specContent: string): Array<{ id: string; description: string }> {
  const requirements: Array<{ id: string; description: string }> = [];
  const regex = /(?:FR|NFR|REQ)-?\d+[^\n]*/gi;
  const matches = specContent.match(regex);
  if (matches) {
    for (const match of matches) {
      const parts = match.split(/[:\-|]/).map(p => p.trim());
      requirements.push({
        id: parts[0] || match.slice(0, 8),
        description: parts[1] || parts[0] || match,
      });
    }
  }
  return requirements;
}

/**
 * Parse tasks.md to extract tasks
 */
function parseTasks(tasksContent: string): Array<{ id: string; description: string; done: boolean }> {
  const tasks: Array<{ id: string; description: string; done: boolean }> = [];
  const regex = /- \[([ x])\] (T\d+)[^\n]*/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(tasksContent)) !== null) {
    tasks.push({
      id: match[2] || "",
      description: match[0].replace(/- \[[ x]\] T\d+\s*/, "").trim(),
      done: match[1] === "x",
    });
  }
  return tasks;
}

/**
 * Register MCP Apps tools
 */
export function registerMcpAppsTools(server: McpServer): void {
  
  // Tool: speckit_dashboard - Interactive workflow dashboard
  server.tool(
    "speckit_dashboard",
    "Generate an interactive workflow dashboard showing progress, coverage statistics, and quality metrics for the current feature. Returns a rich HTML visualization via MCP Apps.",
    {
      featureName: z.string().optional().describe("Name of the feature to display dashboard for. Auto-detected if not provided."),
    },
    async ({ featureName }) => {
      const projectPath = process.cwd();
      const specsDir = path.join(projectPath, "specs");
      
      // Auto-detect feature name
      const displayName = featureName || "Current Feature";
      
      // Detect which artifacts exist
      let hasSpec = false, hasPlan = false, hasTasks = false, hasValidation = false;
      let specContent = "", tasksContent = "";
      
      try {
        const files = await fs.readdir(specsDir);
        for (const f of files) {
          if (f.includes("spec") && f.endsWith(".md")) { hasSpec = true; specContent = await fs.readFile(path.join(specsDir, f), "utf-8"); }
          if (f.includes("plan") && f.endsWith(".md")) hasPlan = true;
          if (f.includes("tasks") && f.endsWith(".md")) { hasTasks = true; tasksContent = await fs.readFile(path.join(specsDir, f), "utf-8"); }
        }
        try {
          const validations = await fs.readdir(path.join(specsDir, "validations"));
          hasValidation = validations.length > 0;
        } catch { /* no validations dir */ }
      } catch { /* no specs dir */ }
      
      // Build workflow steps
      const steps = [
        { name: "Specification", status: (hasSpec ? "done" : "pending") as "done" | "active" | "pending", artifact: hasSpec ? "spec.md" : undefined },
        { name: "Planning", status: (hasPlan ? "done" : hasSpec ? "active" : "pending") as "done" | "active" | "pending", artifact: hasPlan ? "plan.md" : undefined },
        { name: "Task Breakdown", status: (hasTasks ? "done" : hasPlan ? "active" : "pending") as "done" | "active" | "pending", artifact: hasTasks ? "tasks.md" : undefined },
        { name: "Implementation", status: (hasTasks && tasksContent.includes("- [x]") ? (tasksContent.includes("- [ ]") ? "active" : "done") : "pending") as "done" | "active" | "pending" },
        { name: "Validation", status: (hasValidation ? "done" : "pending") as "done" | "active" | "pending" },
      ];
      
      // Calculate stats
      const requirements = parseRequirements(specContent);
      const tasks = parseTasks(tasksContent);
      const doneTasks = tasks.filter(t => t.done).length;
      const coverage = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
      
      const html = generateWorkflowDashboardHtml(displayName, steps, {
        requirements: requirements.length,
        tasks: tasks.length,
        coverage,
        issues: 0,
      });
      
      return {
        content: [
          {
            type: "text" as const,
            text: `## 📊 Workflow Dashboard: ${displayName}\n\nArtifacts: Spec ${hasSpec ? "✅" : "❌"} | Plan ${hasPlan ? "✅" : "❌"} | Tasks ${hasTasks ? "✅" : "❌"} | Validation ${hasValidation ? "✅" : "❌"}\nRequirements: ${requirements.length} | Tasks: ${tasks.length} (${doneTasks} done) | Coverage: ${coverage}%`,
          },
          {
            type: "resource" as const,
            resource: {
              uri: "speckit://app/dashboard",
              mimeType: "text/html",
              text: html,
            },
          },
        ],
      };
    }
  );

  // Tool: speckit_traceability - Interactive traceability matrix
  server.tool(
    "speckit_traceability",
    "Generate an interactive traceability matrix showing how requirements map to tasks, with coverage status. Returns a rich HTML visualization via MCP Apps.",
    {
      featureName: z.string().optional().describe("Name of the feature. Auto-detected if not provided."),
    },
    async ({ featureName }) => {
      const projectPath = process.cwd();
      const specsDir = path.join(projectPath, "specs");
      const displayName = featureName || "Current Feature";
      
      let specContent = "", tasksContent = "";
      
      try {
        const files = await fs.readdir(specsDir);
        for (const f of files) {
          if (f.includes("spec") && f.endsWith(".md")) specContent = await fs.readFile(path.join(specsDir, f), "utf-8");
          if (f.includes("tasks") && f.endsWith(".md")) tasksContent = await fs.readFile(path.join(specsDir, f), "utf-8");
        }
      } catch { /* no specs dir */ }
      
      const requirements = parseRequirements(specContent);
      const tasks = parseTasks(tasksContent);
      
      // Build traceability matrix
      const matrix = requirements.map(req => {
        // Find tasks that reference this requirement
        const matchedTasks = tasks.filter(t =>
          t.description.includes(req.id) || t.id.includes(req.id)
        );
        return {
          req: req.id,
          description: req.description.slice(0, 80),
          tasks: matchedTasks.map(t => t.id),
          status: matchedTasks.length > 0 ? (matchedTasks.every(t => t.done) ? "covered" : "partial") : "uncovered",
        };
      });
      
      // If no requirements parsed, create a generic entry
      if (matrix.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `## 🔗 Traceability Matrix: ${displayName}\n\n⚠️ No requirements with IDs (FR-XXX, NFR-XXX) found in the specification.\n\nTo enable traceability:\n1. Use requirement IDs in your spec (e.g., FR-001, NFR-001)\n2. Reference them in tasks (e.g., [FR-001])\n3. Run this tool again`,
          }],
        };
      }
      
      const html = generateTraceabilityHtml(displayName, matrix);
      
      const covered = matrix.filter(r => r.status === "covered").length;
      const partial = matrix.filter(r => r.status === "partial").length;
      const uncovered = matrix.filter(r => r.status === "uncovered").length;
      
      return {
        content: [
          {
            type: "text" as const,
            text: `## 🔗 Traceability Matrix: ${displayName}\n\n${covered} covered | ${partial} partial | ${uncovered} uncovered (out of ${matrix.length} requirements)`,
          },
          {
            type: "resource" as const,
            resource: {
              uri: "speckit://app/traceability",
              mimeType: "text/html",
              text: html,
            },
          },
        ],
      };
    }
  );
}
