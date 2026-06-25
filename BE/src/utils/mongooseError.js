import { BadRequestError, ConflictError } from '../error/error.js';

export function mapMongooseError(err) {
  if (err.statusCode) return err;

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    return new BadRequestError(message);
  }

  if (err.name === 'CastError') {
    return new BadRequestError('Invalid ID format');
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return new ConflictError(`${field} already exists`);
  }

  return err;
}
