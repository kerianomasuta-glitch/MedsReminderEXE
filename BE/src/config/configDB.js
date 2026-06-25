import { configDotenv } from 'dotenv';

configDotenv();

export default {
  uri: process.env.PROD_MONGO_URI,
};
