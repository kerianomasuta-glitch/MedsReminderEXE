import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import { scopePerRequest } from 'awilix-express';
import container from './container.js';
import { setupSwagger } from './src/config/swagger.js';
import { handleError } from './src/api/middleware/middleware.js';

configDotenv();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(scopePerRequest(container));
setupSwagger(app);

// import routes

app.get('/', (req, res) => {
  res.send('MedsReminder API is running');
});

const url = 'api/v1';

// use routes

app.use(handleError);

export default app;
