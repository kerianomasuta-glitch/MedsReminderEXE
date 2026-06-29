import { configDotenv } from 'dotenv';

configDotenv();

import './src/models/model.js';
import app from './app.js';
import connectDB from './src/db/db.js';
import http from 'http';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

connectDB()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on PORT: ${PORT}`);
      console.log(`Swagger: http://localhost:${PORT}/api-docs`);
      console.log(`LAN: use your computer IP with port ${PORT} for mobile devices`);
    });
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
