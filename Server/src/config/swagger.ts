import swaggerJSDoc from 'swagger-jsdoc';
import config from './config';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Shuffle API Documentation',
        version: '1.0.0',
        description: 'Documentation for the Shuffle backend API',
        contact: {
            name: 'Happy Coders',
        },
    },
    servers: [
        {
            url: `http://localhost:${config.server.port}${config.server.apiPrefix}`,
            description: 'Development server',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

