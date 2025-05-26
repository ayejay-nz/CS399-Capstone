import express from 'express';
import config from './config/config';
import errorHandler from './middlewares/errorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import cors from 'cors';

import examSourceRoutes from './routes/examSourceRoutes';
import coverPageRoutes from './routes/coverPageRoutes';
import answerKeyRoutes from './routes/answerKeyRoutes';
import teleformDataRoutes from './routes/teleformRoutes';
import assetRoutes from './routes/assetRoutes';
import examBundleRoutes from './routes/examBundleRoutes';
import markingRoutes from './routes/markingRoutes';

const app = express();

// Middlewares
app.use(express.json({ limit: '5mb' }));

app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    }),
);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/hello-world', (req, res) => {
    res.send('Hello World!');
});

app.use(`${config.server.apiPrefix}/exam-source`, examSourceRoutes);
app.use(`${config.server.apiPrefix}/cover-page`, coverPageRoutes);
app.use(`${config.server.apiPrefix}/answer-key`, answerKeyRoutes);
app.use(`${config.server.apiPrefix}/teleform-data`, teleformDataRoutes);
app.use(`${config.server.apiPrefix}/asset`, assetRoutes);
app.use(`${config.server.apiPrefix}/exam-bundle`, examBundleRoutes);
app.use(`${config.server.apiPrefix}/marking`, markingRoutes);

app.use(errorHandler);

export default app;
