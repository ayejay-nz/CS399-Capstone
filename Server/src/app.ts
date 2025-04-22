import express from 'express'; 
import config from './config/config'; 
import errorHandler from './middlewares/errorHandler'; 

import examSourceRoutes from './routes/examSourceRoutes';
import coverPageRoutes from './routes/coverPageRoutes';

const app = express();  

// Middlewares 
app.use(express.json());  

// Routes
app.get('/', (req, res) => {     
    res.send('Hello World!'); 
}); 

app.use(`${config.server.apiPrefix}/exam-source`, examSourceRoutes);
app.use(`${config.server.apiPrefix}/cover-page`, coverPageRoutes);

app.use(errorHandler);  

export default app; 
