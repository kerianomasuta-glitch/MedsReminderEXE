import { UAParser } from 'ua-parser-js';
import {
  AuthenticationError,
  BadRequestError,
  ForbiddenError,
} from '../../error/error.js';
import { mapMongooseError } from '../../utils/mongooseError.js';

export const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!accessToken) {
      throw new AuthenticationError('Token expired or does not exist');
    }

    const tokenService = req.container.resolve('tokenService');
    const decode = await tokenService.verifyAccessToken({ token: accessToken });

    if (!decode) {
      throw new AuthenticationError('Cannot authenticate: token expired or invalid');
    }

    req.user = decode;
    next();
  } catch (err) {
    next(err);
  }
};

export const authorizationByRole = (roles) => (req, res, next) => {
  try {
    if (!roles.includes(req.user.roleName)) {
      throw new ForbiddenError();
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const getUserDeviceName = (req, res, next) => {
  const ua = req.headers['user-agent'];
  const parser = new UAParser(ua);
  const result = parser.getResult();

  const browser = `${result.browser.name || 'Unknown browser'}-${result.browser.version || ''}`;
  const os = `${result.os.name || 'Unknown os'}-${result.os.version || ''}`;
  const device = result.device;

  if (device?.type === 'tablet' || device?.type === 'mobile') {
    const vendor = device.vendor || '';
    const model = device.model || '';
    req.device = `${vendor}:${model}:${browser}:${os}`;
  } else {
    req.device = `${browser}:${os}`;
  }

  next();
};

export const handleError = (err, req, res, _next) => {
  const mappedError = mapMongooseError(err);
  const statusCode = mappedError.statusCode || 500;
  const message = mappedError.message || 'Server error';
  const status = statusCode !== 500 ? 'error' : 'fail';

  res.status(statusCode).json({ status, message });
};

export const validateData = (schema, property = 'body') => (req, res, next) => {
  try {
    const dataToValidate = req[property];

    if (!dataToValidate) {
      throw new BadRequestError(`Missing ${property} in request`);
    }

    const { error } = schema.validate(dataToValidate);

    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    next();
  } catch (err) {
    next(err);
  }
};
