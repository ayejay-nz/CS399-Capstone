import { v4 as uuidv4 } from 'uuid';
import { AnswerKey } from '../dataTypes/answerKey';
import { ExamMarkingSession, SessionStore } from '../dataTypes/session';
import config from '../config/config';
import { configDotenv } from 'dotenv';
import { TeleformData } from '../dataTypes/teleformData';
import { ExamBreakdown } from '../dataTypes/examBreakdown';
import { isCoverpage } from '../utils/typeGuards';

class SessionManager implements SessionStore {
    public sessions: Map<string, ExamMarkingSession> = new Map();
    public cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.startCleanupProcess();
    }

    /**
     * Create a new session for an answer key
     */
    createSession(
        answerKey?: AnswerKey,
        metadata?: Partial<ExamMarkingSession['metadata']>,
    ): string {
        // Check session limits
        if (this.sessions.size >= config.session.maxSessions) {
            this.evictOldestSession();
        }

        // Check memory usage
        const memoryUsageMB = this.getMemoryUsage();
        if (memoryUsageMB > config.session.maxMemoryUsageMB) {
            this.evictOldestSession();
        }

        const sessionId = uuidv4();
        const now = new Date();
        const expiresAt = new Date(
            now.getTime() + config.session.defaultExpiryHours * 60 * 60 * 1000,
        );

        const session: ExamMarkingSession = {
            sessionId,
            answerKey,
            createdAt: now,
            expiresAt,
            lastAccessedAt: now,
            metadata,
        };

        this.sessions.set(sessionId, session);

        console.log(`Created session ${sessionId}, expires: ${session.expiresAt.toISOString()}`);
        return sessionId;
    }

    /**
     * Retrieve a session by its ID
     */
    getSession(sessionId: string): ExamMarkingSession | null {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }

        // Check if it has expired
        if (new Date() > session.expiresAt) {
            this.sessions.delete(sessionId);
            console.log(`Session ${sessionId} expired and removed`);
            return null;
        }

        return session;
    }

    /**
     * Update session access time
     */
    updateSessionAccess(sessionId: string): boolean {
        const session = this.getSession(sessionId);
        if (!session) {
            return false;
        }

        session.lastAccessedAt = new Date();
        return true;
    }

    /**
     * Delete a session by its ID
     */
    deleteSession(sessionId: string): boolean {
        const existed = this.sessions.has(sessionId);
        this.sessions.delete(sessionId);

        if (existed) {
            console.log(`Deleted session: ${sessionId}`);
        }

        return existed;
    }

    /**
     * Clean up expired sessions
     */
    cleanup(): number {
        const now = new Date();
        let cleanedCount = 0;

        for (const [sessionId, session] of this.sessions.entries()) {
            if (now > session.expiresAt) {
                this.deleteSession(sessionId);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} expired sessions`);
        }

        return cleanedCount;
    }

    /**
     * Get current memory usage in MB (estimate)
     */
    getMemoryUsage(): number {
        let totalSize = 0;

        for (const session of this.sessions.values()) {
            // Estimate of memory usage
            const sessionJson = JSON.stringify(session);
            totalSize += Buffer.byteLength(sessionJson, 'utf-8');
        }

        return totalSize / (1024 * 1024);
    }

    /**
     * Get the number of active sessions
     */
    getActiveSessionCount(): number {
        this.cleanup();
        return this.sessions.size;
    }

    /**
     * Evict the oldest session (LRU)
     */
    private evictOldestSession(): void {
        let oldestSession: string | null = null;
        let oldestTime = new Date();

        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.lastAccessedAt < oldestTime) {
                oldestTime = session.lastAccessedAt;
                oldestSession = sessionId;
            }
        }

        if (oldestSession) {
            this.deleteSession(oldestSession);
            console.log(`Evicted oldest session: ${oldestSession}`);
        }
    }

    /**
     * Start the cleanup process
     */
    private startCleanupProcess(): void {
        const interalMins = config.session.cleanupIntervalMinutes * 60 * 1000;

        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, interalMins);

        console.log(
            `Session cleanup process started (interval: ${config.session.cleanupIntervalMinutes} minutes)`,
        );
    }

    /**
     * Stop the cleanup process
     */
    private stopCleanupProcess(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            console.log('Session cleanup process stopped');
        }
    }

    /**
     * Extend session expiry
     */
    refreshSession(sessionId: string): boolean {
        const session = this.getSession(sessionId);

        if (!session) {
            return false;
        }

        const now = new Date();
        session.expiresAt = new Date(
            now.getTime() + config.session.defaultExpiryHours * 60 * 60 * 1000,
        );
        session.lastAccessedAt = now;

        console.log(
            `Refreshed session ${sessionId}, new expiry: ${session.expiresAt.toISOString()}`,
        );
        return true;
    }

    /**
     * Add teleform data to existing session
     */
    addTeleformData(sessionId: string, teleformData: TeleformData, filename?: string): boolean {
        const session = this.getSession(sessionId);
        if (!session) {
            return false;
        }

        session.teleformData = teleformData;
        session.lastAccessedAt = new Date();

        if (filename && session.metadata) {
            session.metadata.teleformDataFilename = filename;
        }

        console.log(`Teleform data added to session: ${sessionId}`);
        return true;
    }

    /**
     * Update exam breakdown for existing session
     */
    updateExamBreakdown(sessionId: string, examBreakdown: ExamBreakdown): boolean {
        const session = this.getSession(sessionId);
        if (!session) {
            return false;
        }

        session.examBreakdown = examBreakdown;
        session.lastAccessedAt = new Date();

        console.log(`Exam breakdown updated for session: ${sessionId}`);
        return true;
    }

    /**
     * Check if session is complete (has answer key and teleform data)
     */
    isSessionComplete(sessionId: string): boolean {
        const session = this.getSession(sessionId);
        return !!(session?.answerKey && session?.teleformData);
    }

    /**
     * Add unparsed coverpage buffer to existing session
     */
    addUnparsedCoverpage(sessionId: string, coverpageBuffer: Buffer, filename?: string): boolean {
        const session = this.getSession(sessionId);
        if (!session) {
            return false;
        }

        session.unparsedCoverpageBuffer = coverpageBuffer;
        session.lastAccessedAt = new Date();

        if (filename && session.metadata) {
            session.metadata.coverpageFilename = filename;
            session.metadata.coverpageFileSize = coverpageBuffer.length;
        }

        console.log(`Unparsed coverpage buffer added to session: ${sessionId}`);
        return true;
    }

    /**
     * Check if session has coverpage (unparsed)
     */
    hasCoverpage(sessionId: string): boolean {
        const session = this.getSession(sessionId);
        // Note: For now, we only check for unparsed coverpage buffer
        // Parsed coverpage would be in ExamData when exam is generated, not stored in session
        return !!session?.unparsedCoverpageBuffer;
    }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;
