import dotenv from 'dotenv';

dotenv.config();

const MB = 1024 * 1024;

const MAX_SOURCE_FILE_MB = 10;
const MAX_COVER_PAGE_FILE_MB = 2;
const MAX_MARKING_FILE_MB = 2;
const MAX_ASSET_FILE_MB = 1;

interface Config {
    server: {
        port: number;
        nodeEnv: string;
    },
    upload: {
        maxSourceFileSize: number;
        maxCoverPageFileSize: number;
        maxMarkingFileSize: number;
        maxAssetFileSize: number;
    }
}

const config: Config = {
    server: {
        port: Number(process.env.PORT) || 8000,
        nodeEnv: process.env.NODE_ENV || 'development',
    },
    upload: {
        maxSourceFileSize: MAX_SOURCE_FILE_MB * MB,
        maxCoverPageFileSize: MAX_COVER_PAGE_FILE_MB * MB,
        maxMarkingFileSize: MAX_MARKING_FILE_MB * MB,
        maxAssetFileSize: MAX_ASSET_FILE_MB * MB,
    },
};

export default config;
