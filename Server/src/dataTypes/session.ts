import { AnswerKey } from './answerKey';
import { ExamBreakdown } from './examBreakdown';
import { TeleformData } from './teleformData';

export interface ExamMarkingSession {
    sessionId: string;
    answerKey?: AnswerKey;
    teleformData?: TeleformData;
    examBreakdown?: ExamBreakdown;
    unparsedCoverpageBuffer?: Buffer;
    createdAt: Date;
    expiresAt: Date;
    lastAccessedAt: Date;
    metadata?: {
        answerKeyFilename?: string;
        teleformDataFilename?: string;
        coverpageFilename?: string;
        uploadedBy?: string;
        answerKeyFileSize?: number;
        teleformDataFileSize?: number;
        coverpageFileSize?: number;
    };
}

export interface SessionStore {
    sessions: Map<string, ExamMarkingSession>;
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
