import express from 'express';
import config from './config/config';
import errorHandler from './middlewares/errorHandler';

import examSourceRoutes from './routes/examSourceRoutes';
import coverPageRoutes from './routes/coverPageRoutes';
import answerKeyRoutes from './routes/answerKeyRoutes';
import teleformDataRoutes from './routes/teleformRoutes';
import assetRoutes from './routes/assetRoutes';

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.get('/hello-world', (req, res) => {
    res.send('Hello World!');
});

app.use(`${config.server.apiPrefix}/exam-source`, examSourceRoutes);
app.use(`${config.server.apiPrefix}/cover-page`, coverPageRoutes);
app.use(`${config.server.apiPrefix}/answer-key`, answerKeyRoutes);
app.use(`${config.server.apiPrefix}/teleform-data`, teleformDataRoutes);
app.use(`${config.server.apiPrefix}/asset`, assetRoutes);

app.use(errorHandler);

export default app;
