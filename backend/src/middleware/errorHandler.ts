import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { 
  ValidationError, 
  UniqueConstraintError, 
  ForeignKeyConstraintError,
  DatabaseError 
} from 'sequelize';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle Sequelize validation errors
  if (err instanceof ValidationError) {
    logger.error('Validation error:', {
      message: err.message,
      errors: err.errors,
      path: req.path,
      method: req.method
    });

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      })),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle unique constraint violations
  if (err instanceof UniqueConstraintError) {
    logger.error('Unique constraint violation:', {
      message: err.message,
      fields: err.fields,
      path: req.path,
      method: req.method
    });

    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message,
        stack: err.stack 
      })
    });
  }

  // Handle foreign key constraint violations
  if (err instanceof ForeignKeyConstraintError) {
    logger.error('Foreign key constraint violation:', {
      message: err.message,
      path: req.path,
      method: req.method
    });

    return res.status(400).json({
      success: false,
      message: 'Invalid reference to related resource',
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message,
        stack: err.stack 
      })
    });
  }

  // Handle general database errors
  if (err instanceof DatabaseError) {
    logger.error('Database error:', {
      message: err.message,
      path: req.path,
      method: req.method,
      sql: (err as any).sql
    });

    return res.status(500).json({
      success: false,
      message: 'Database operation failed',
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message,
        stack: err.stack 
      })
    });
  }

  // Unexpected errors
  logger.error('Unexpected error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      originalError: err.message,
      stack: err.stack 
    })
  });
};
