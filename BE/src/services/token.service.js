import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthenticationError } from '../error/error.js';

const parseTtlSeconds = (value, fallback) => {
  if (!value) return fallback;
  const match = String(value).trim().match(/^(\d+)\s*([smhd])?$/i);
  if (!match) return fallback;
  const amount = Number(match[1]);
  const unit = (match[2] || 's').toLowerCase();
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * multipliers[unit];
};

class TokenService {
  constructor({ redisClient }) {
    this.redis = redisClient;
    this.accessSecret = process.env.JWT_SECRET;
    this.refreshSecret = process.env.REFRESH_JWT_SECRET;
    this.accessTtl = parseTtlSeconds(process.env.JWT_ACCESS_EXPIRES, 15 * 60);
    this.refreshTtl = parseTtlSeconds(process.env.JWT_REFRESH_EXPIRES, 7 * 86400);
  }

  #refreshKey(userId, deviceId) {
    return `refresh:${userId}:${deviceId}`;
  }

  async generateAuthTokens({ userId, name, roleId, roleName, deviceId }) {
    const finalDeviceId = deviceId
      || `DEVICE_${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    const accessToken = jwt.sign(
      { userId, fullName: name, roleId, roleName, deviceId: finalDeviceId },
      this.accessSecret,
      { expiresIn: this.accessTtl },
    );

    const refreshToken = jwt.sign(
      { userId, deviceId: finalDeviceId, roleName },
      this.refreshSecret,
      { expiresIn: this.refreshTtl },
    );

    return { accessToken, refreshToken, deviceId: finalDeviceId };
  }

  async storeRefreshToken({ userId, deviceId, refreshToken, deviceName = 'unknown' }) {
    await this.redis.set(
      this.#refreshKey(userId, deviceId),
      JSON.stringify({ refreshToken, deviceName, createdAt: Date.now() }),
      'EX',
      this.refreshTtl,
    );
  }

  async verifyAccessToken({ token }) {
    try {
      return jwt.verify(token, this.accessSecret);
    } catch {
      return null;
    }
  }

  async verifyRefreshToken({ token }) {
    let decoded;
    try {
      decoded = jwt.verify(token, this.refreshSecret);
    } catch {
      throw new AuthenticationError('Refresh token expired or invalid');
    }

    const stored = await this.redis.get(this.#refreshKey(decoded.userId, decoded.deviceId));
    if (!stored) {
      throw new AuthenticationError('Refresh token has been revoked');
    }

    const parsed = JSON.parse(stored);
    if (parsed.refreshToken !== token) {
      throw new AuthenticationError('Refresh token expired or invalid');
    }

    return decoded;
  }

  async revokeRefreshToken({ userId, deviceId }) {
    const deleted = await this.redis.del(this.#refreshKey(userId, deviceId));
    return deleted > 0;
  }

  async revokeAllUserTokens({ userId }) {
    const pattern = this.#refreshKey(userId, '*');
    const stream = this.redis.scanStream({ match: pattern, count: 100 });

    for await (const keys of stream) {
      if (keys.length) {
        await this.redis.del(...keys);
      }
    }
  }
}

export default TokenService;
