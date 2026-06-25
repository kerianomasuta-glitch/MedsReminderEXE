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

    // Defaults: access 15m, refresh 7d
    this.accessTtl = parseTtlSeconds(process.env.JWT_ACCESS_EXPIRES, 15 * 60);
    this.refreshTtl = parseTtlSeconds(process.env.JWT_REFRESH_EXPIRES, 7 * 86400);
  }

  #refreshKey(userId, jti) {
    return `refresh:${userId}:${jti}`;
  }

  #buildPayload(payload) {
    const userId = payload.sub || payload.id || payload._id;
    if (!userId) {
      throw new AuthenticationError('Token payload must contain a user id');
    }
    return {
      sub: String(userId),
      roleName: payload.roleName || payload.role,
    };
  }

  generateAccessToken(payload) {
    const data = this.#buildPayload(payload);
    return jwt.sign(data, this.accessSecret, {
      expiresIn: this.accessTtl,
    });
  }

  async generateRefreshToken(payload, { device = 'unknown' } = {}) {
    const data = this.#buildPayload(payload);
    const jti = crypto.randomUUID();

    const token = jwt.sign({ ...data, jti }, this.refreshSecret, {
      expiresIn: this.refreshTtl,
    });

    await this.redis.set(
      this.#refreshKey(data.sub, jti),
      JSON.stringify({ device, createdAt: Date.now() }),
      'EX',
      this.refreshTtl
    );

    return token;
  }

  async generateAuthTokens(payload, { device = 'unknown' } = {}) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload, { device });
    return { accessToken, refreshToken };
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

    const exists = await this.redis.exists(this.#refreshKey(decoded.sub, decoded.jti));
    if (!exists) {
      throw new AuthenticationError('Refresh token has been revoked');
    }

    return decoded;
  }

  // Verify the old refresh token, revoke it, and issue a fresh pair.
  async rotateRefreshToken({ token, device = 'unknown' } = {}) {
    const decoded = await this.verifyRefreshToken({ token });
    await this.revokeRefreshToken({ userId: decoded.sub, jti: decoded.jti });
    return this.generateAuthTokens(
      { sub: decoded.sub, roleName: decoded.roleName },
      { device }
    );
  }

  async revokeRefreshToken({ userId, jti }) {
    await this.redis.del(this.#refreshKey(userId, jti));
  }

  // Revoke every active refresh token for a user (e.g. on logout-all / password change).
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
