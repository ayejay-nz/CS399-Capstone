import dotenv from 'dotenv';

dotenv.config();

interface Config {
    server: {
        port: number;
        nodeEnv: string;
    }
}

const config: Config = {
    server: {
        port: Number(process.env.PORT) || 8000,
        nodeEnv: process.env.NODE_ENV || 'development',
    }
};

export default config;
