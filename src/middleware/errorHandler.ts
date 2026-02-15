import { ZodError } from 'zod';
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError
} from '../utils/errors';
import { error } from '../utils/response';

export function handleError(err: Error): Response {
  if (err instanceof UnauthorizedError) {
    return Response.json(error(err.name, err.message), { status: err.statusCode });
  }

  if (err instanceof ForbiddenError) {
    return Response.json(error(err.name, err.message), { status: err.statusCode });
  }

  if (err instanceof NotFoundError) {
    return Response.json(error(err.name, err.message), { status: err.statusCode });
  }

  if (err instanceof ConflictError) {
    return Response.json(error(err.name, err.message), { status: err.statusCode });
  }

  if (err instanceof ValidationError) {
    return Response.json(error(err.name, err.message), { status: err.statusCode });
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    return Response.json(
      error('ValidationError', 'Invalid input provided', details),
      { status: 400 }
    );
  }

  console.error('Unexpected error:', err);
  return Response.json(
    error('InternalServerError', 'An unexpected error occurred'),
    { status: 500 }
  );
}
