/**
 * Guided Init Session Store
 * 
 * Tracks multi-step guided init state across tool calls.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import type { StackDetection } from "./stackDetector.js";
import type { ConstitutionAnswers } from "./constitutionUpdater.js";

export interface InitGuidedSession {
  sessionId: string;
  projectPath: string;
  status: "active" | "completed" | "cancelled";
  stepIndex: number;
  answers: ConstitutionAnswers;
  skippedKeys: Array<keyof ConstitutionAnswers>;
  detection: StackDetection;
  createdAt: string;
  updatedAt: string;
}

class InitGuidedSessionStore {
  private readonly sessions: Map<string, InitGuidedSession> = new Map();
  private readonly persistDir: string;

  constructor() {
    this.persistDir = path.join(os.tmpdir(), "spec-kit-init-sessions");
  }

  async init(): Promise<void> {
    try {
      await fs.mkdir(this.persistDir, { recursive: true });
      const files = await fs.readdir(this.persistDir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const content = await fs.readFile(path.join(this.persistDir, file), "utf-8");
          const session = JSON.parse(content) as InitGuidedSession;
          this.sessions.set(session.sessionId, session);
        }
      }
    } catch {
      // No persisted sessions
    }
  }

  generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `init-${timestamp}-${random}`;
  }

  async create(projectPath: string, detection: StackDetection): Promise<InitGuidedSession> {
    const sessionId = this.generateSessionId();
    const now = new Date().toISOString();

    const session: InitGuidedSession = {
      sessionId,
      projectPath,
      status: "active",
      stepIndex: 0,
      answers: {},
      skippedKeys: [],
      detection,
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(sessionId, session);
    await this.persist(session);

    return session;
  }

  get(sessionId: string): InitGuidedSession | undefined {
    return this.sessions.get(sessionId);
  }

  getActiveSession(projectPath: string): InitGuidedSession | undefined {
    let latest: InitGuidedSession | undefined;
    for (const session of this.sessions.values()) {
      if (session.status === "active" && session.projectPath === projectPath) {
        if (!latest || session.updatedAt > latest.updatedAt) {
          latest = session;
        }
      }
    }
    return latest;
  }

  async update(session: InitGuidedSession): Promise<void> {
    session.updatedAt = new Date().toISOString();
    this.sessions.set(session.sessionId, session);
    await this.persist(session);
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    const filePath = path.join(this.persistDir, `${sessionId}.json`);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore
    }
  }

  private async persist(session: InitGuidedSession): Promise<void> {
    const filePath = path.join(this.persistDir, `${session.sessionId}.json`);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2), "utf-8");
  }
}

export const initGuidedSessionStore = new InitGuidedSessionStore();

await initGuidedSessionStore.init();
