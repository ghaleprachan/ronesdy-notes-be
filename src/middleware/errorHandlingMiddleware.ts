import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';
import config from '../config';

const env = config.NODE_ENV;
// Custom error classes
class CustomError extends Error {
  constructor(
    public statusCode: number,
    message?: string,
    public serviceName?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends CustomError {
  constructor(message?: string, serviceName?: string) {
    super(404, message ?? 'Not Found', serviceName);
  }
}

export class InternalServerError extends CustomError {
  constructor(message?: string, serviceName?: string) {
    super(500, message ?? 'Internal Server Error', serviceName);
  }
}
export class BadRequestError extends CustomError {
  constructor(message?: string, serviceName?: string) {
    super(401, message ?? 'Bad Request Error', serviceName);
  }
}

export class ValidationError extends CustomError {
  constructor(message?: string, serviceName?: string) {
    super(401, message ?? 'Validation Error', serviceName);
  }
}

export class ConflictError extends CustomError {
  constructor(message?: string, serviceName?: string) {
    super(409, message ?? 'Conflict Error', serviceName);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message?: string, serviceName?: string) {
    super(403, message ?? 'Forbidden Error', serviceName);
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof CustomError) {
    console.log('error',err)  
    if (env === 'local' && err.serviceName) {
      res.status(err.statusCode).json({
        message: err.message,
        serviceName: err.serviceName,
        stack: err.stack,
      });
      return;
    } else {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
  } else {
    // Handle unknown errors
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }
};
