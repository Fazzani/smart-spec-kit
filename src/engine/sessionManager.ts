/**
 * Workflow Session Manager
 * 
 * Manages workflow execution state with persistence.
 * Each session tracks: current step, collected data, and workflow context.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

/**
 * Data collected during workflow execution
 */
export interface WorkflowData {
  /** Raw work item data from Azure DevOps */
  workItemData?: Record<string, unknown>;
  /** Generated specification content */
  specification?: string;
  /** Technical plan */
  technicalPlan?: string;
  /** Validation reports */
  validations?: {
    rgpd?: { status: string; issues: string[] };
    security?: { status: string; issues: string[] };
    architecture?: { status: string; issues: string[] };
    design?: { status: string; issues: string[] };
    general?: { status: string; issues: string[] };
    [key: string]: { status: string; issues: string[] } | undefined;
  };
  /** Generated tasks */
  tasks?: Array<{ id: string; title: string; estimate: string }>;
  /** Any additional data collected during steps */
  [key: string]: unknown;
}

/**
 * Workflow session state
 */
export interface WorkflowSession {
  /** Unique session identifier */
  sessionId: string;
  /** Workflow name being executed */
  workflowName: string;
  /** Context ID (e.g., Azure DevOps work item ID) */
  contextId: string;
  /** Current step index */
  currentStepIndex: number;
  /** Current step ID */
  currentStepId: string;
  /** Session status */
  status: "active" | "paused" | "completed" | "failed";
  /** Collected data from all steps */
  data: WorkflowData;
  /** Timestamp of session creation */
  createdAt: string;
  /** Timestamp of last update */
  updatedAt: string;
  /** History of executed steps */
  history: Array<{
    stepId: string;
    stepName: string;
    status: "completed" | "skipped" | "failed";
    timestamp: string;
    output?: string;
  }>;
  /** Pending action for Copilot */
  pendingAction?: {
    type: "call_tool" | "user_input" | "confirmation" | "generate";
    instruction: string;
    toolName?: string;
    toolArgs?: Record<string, unknown>;
  };
}

/**
 * Session store - in-memory with file persistence
 */
class SessionStore {
  private sessions: Map<string, WorkflowSession> = new Map();
  private persistDir: string;

  constructor() {
    this.persistDir = path.join(os.tmpdir(), "spec-kit-sessions");
  }

  /**
   * Initialize the session store
   */
  async init(): Promise<void> {
    try {
      await fs.mkdir(this.persistDir, { recursive: true });
      // Load existing sessions
      const files = await fs.readdir(this.persistDir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const content = await fs.readFile(path.join(this.persistDir, file), "utf-8");
          const session = JSON.parse(content) as WorkflowSession;
          this.sessions.set(session.sessionId, session);
        }
      }
    } catch {
      // Directory might not exist yet, that's fine
    }
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `wf-${timestamp}-${random}`;
  }

  /**
   * Create a new session
   */
  async create(
    workflowName: string,
    contextId: string,
    firstStepId: string
  ): Promise<WorkflowSession> {
    const sessionId = this.generateSessionId();
    const now = new Date().toISOString();

    const session: WorkflowSession = {
      sessionId,
      workflowName,
      contextId,
      currentStepIndex: 0,
      currentStepId: firstStepId,
      status: "active",
      data: {},
      createdAt: now,
      updatedAt: now,
      history: [],
    };

    this.sessions.set(sessionId, session);
    await this.persist(session);

    return session;
  }

  /**
   * Get a session by ID
   */
  get(sessionId: string): WorkflowSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get the most recent active session
   */
  getActiveSession(): WorkflowSession | undefined {
    let latest: WorkflowSession | undefined;
    for (const session of this.sessions.values()) {
      if (session.status === "active") {
        if (!latest || session.updatedAt > latest.updatedAt) {
          latest = session;
        }
      }
    }
    return latest;
  }

  /**
   * Update a session
   */
  async update(session: WorkflowSession): Promise<void> {
    session.updatedAt = new Date().toISOString();
    this.sessions.set(session.sessionId, session);
    await this.persist(session);
  }

  /**
   * Persist session to disk
   */
  private async persist(session: WorkflowSession): Promise<void> {
    const filePath = path.join(this.persistDir, `${session.sessionId}.json`);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2), "utf-8");
  }

  /**
   * Delete a session
   */
  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    const filePath = path.join(this.persistDir, `${sessionId}.json`);
    try {
      await fs.unlink(filePath);
    } catch {
      // File might not exist
    }
  }

  /**
   * List all sessions
   */
  list(): WorkflowSession[] {
    return Array.from(this.sessions.values());
  }
}

// Singleton instance
export const sessionStore = new SessionStore();

// Initialize on module load
sessionStore.init().catch(console.error);
