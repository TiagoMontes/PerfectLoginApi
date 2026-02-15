export class UnauthorizedError extends Error {
  public readonly statusCode = 401;
  public override readonly name = 'UnauthorizedError';

  constructor(message: string = 'Unauthorized') {
    super(message);
  }
}

export class ForbiddenError extends Error {
  public readonly statusCode = 403;
  public override readonly name = 'ForbiddenError';

  constructor(message: string = 'Forbidden') {
    super(message);
  }
}

export class NotFoundError extends Error {
  public readonly statusCode = 404;
  public override readonly name = 'NotFoundError';

  constructor(message: string = 'Not found') {
    super(message);
  }
}

export class ConflictError extends Error {
  public readonly statusCode = 409;
  public override readonly name = 'ConflictError';

  constructor(message: string = 'Conflict') {
    super(message);
  }
}

export class ValidationError extends Error {
  public readonly statusCode = 400;
  public override readonly name = 'ValidationError';

  constructor(message: string = 'Validation failed') {
    super(message);
  }
}
