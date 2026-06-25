import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import { scopePerRequest } from 'awilix-express';
import container from './container.js';
import { setupSwagger } from './src/config/swagger.js';
import { handleError } from './src/api/middleware/middleware.js';
import authRouter from './src/api/routers/auth.route.js';
import roleRouter from './src/api/routers/role.route.js';

configDotenv();

const app = express();

const fallbackOrigins = ['http://localhost:8081', 'http://localhost:5173'];
const envOrigins = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...fallbackOrigins, ...envOrigins])];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
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
app.use(`/${url}/auth`, authRouter);
app.use(`/${url}/roles`, roleRouter);

app.use(handleError);

export default app;
