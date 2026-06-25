import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import { scopePerRequest } from 'awilix-express';
import container from './container.js';
import { setupSwagger } from './src/config/swagger.js';
import { handleError } from './src/api/middleware/middleware.js';
import authRouter from './src/api/routers/auth.route.js';
import roleRouter from './src/api/routers/role.route.js';
import caregiverPatientRouter from './src/api/routers/caregiverPatient.route.js';

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
app.use(`/${url}/auth`, authRouter);
app.use(`/${url}/roles`, roleRouter);
app.use(`/${url}/patients`, caregiverPatientRouter);

app.use(handleError);

export default app;
