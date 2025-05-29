import dotenv from 'dotenv';

dotenv.config();

const MB = 1024 * 1024;

const MAX_EXAM_SOURCE_FILE_MB = 10;
const MAX_COVER_PAGE_FILE_MB = 2;
const MAX_TELEFORM_DATA_FILE_MB = 2;
const MAX_ANSWER_KEY_FILE_MB = 5;
const MAX_ASSET_FILE_MB = 1;

interface Config {
    server: {
        port: number;
        nodeEnv: string;
        apiPrefix: string;
    };
    upload: {
        maxExamSourceFileSize: number;
        maxCoverPageFileSize: number;
        maxTeleformDataFileSize: number;
        maxAnswerKeyFileSize: number;
        maxAssetFileSize: number;
    };
    session: {
        defaultExpiryHours: number;
        maxSessions: number;
        maxMemoryUsageMB: number;
        cleanupIntervalMinutes: number;
        cookieName: string;
        cookieSecure: boolean;
        cookieHttpOnly: boolean;
        cookieSameSite: 'strict' | 'lax' | 'none';
    };
}

const config: Config = {
    server: {
        port: Number(process.env.PORT) || 8000,
        nodeEnv: process.env.NODE_ENV || 'development',
        apiPrefix: process.env.API_PREFIX || '/api/v1',
    },
    upload: {
        maxExamSourceFileSize: MAX_EXAM_SOURCE_FILE_MB * MB,
        maxCoverPageFileSize: MAX_COVER_PAGE_FILE_MB * MB,
        maxTeleformDataFileSize: MAX_TELEFORM_DATA_FILE_MB * MB,
        maxAnswerKeyFileSize: MAX_ANSWER_KEY_FILE_MB * MB,
        maxAssetFileSize: MAX_ASSET_FILE_MB * MB,
    },
    session: {
        defaultExpiryHours: Number(process.env.SESSION_EXPIRY_HOURS) || 2,
        maxSessions: Number(process.env.MAX_SESSIONS) || 128,
        maxMemoryUsageMB: Number(process.env.SESSION_MAX_MEMORY_USAGE_MB) || 32,
        cleanupIntervalMinutes: Number(process.env.SESSION_CLEANUP_INTERVAL_MINUTES) || 15,
        cookieName: 'answerkey_session',
        cookieSecure: process.env.NODE_ENV === 'production',
        cookieHttpOnly: true,
        cookieSameSite: 'lax',
    }
};

export default config;
