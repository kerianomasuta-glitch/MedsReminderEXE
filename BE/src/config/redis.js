import Redis from 'ioredis';
import { configDotenv } from 'dotenv';

configDotenv();

// REDIS_HOST may include a protocol (e.g. https://) from the provider dashboard.
// ioredis expects a bare hostname, so strip any scheme/path/port that sneaks in.
const normalizeHost = (host = '') =>
  host
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/\/.*$/, '')
    .split(':')[0]
    .trim();

const host = normalizeHost(process.env.REDIS_HOST);
const port = Number(process.env.REDIS_PORT) || 6379;
const useTls = String(process.env.REDIS_TLS).toLowerCase() === 'true';

const redisClient = new Redis({
  host,
  port,
  password: process.env.REDIS_PASSWORD,
  ...(useTls ? { tls: { servername: host } } : {}),
  lazyConnect: false,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

redisClient.on('connect', () => {
  console.log(`Connected to Redis (${host}:${port})`);
});

redisClient.on('error', (err) => {
  console.error(`Redis error: ${err.message}`);
});

export default redisClient;
