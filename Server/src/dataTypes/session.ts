import { AnswerKey } from './answerKey';

export interface AnswerKeySession {
    sessionId: string;
    answerKey: AnswerKey;
    createdAt: Date;
    expiresAt: Date;
    lastAccessedAt: Date;
    metadata?: {
        originalFilename?: string;
        uploadedBy?: string;
        fileSize?: number;
    };
}

export interface SessionStore {
    sessions: Map<string, AnswerKeySession>;
    cleanup(): void;
    getMemoryUsage(): number;
}

export interface SessionCreatedResponse {
    sessionId: string;
    expiresAt: Date;
    answerKey: AnswerKey;
}

export interface SessionAccessRequest {
    sessionId: string;
}

export interface SessionStatusResponse {
    sessionId: string;
    isValid: boolean;
    expiresAt: Date;
    lastAccessedAt: Date;
}
