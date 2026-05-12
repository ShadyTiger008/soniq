import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { ApiError } from "../utils/errors.js";

/**
 * Global Error Handler Middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Standardize non-ApiError exceptions (like MongoDB or JWT errors)
  if (!(err instanceof ApiError)) {
    if (err.name === "ValidationError") {
      statusCode = 400;
      message = "Validation Error";
    } else if (err.name === "CastError") {
      statusCode = 400;
      message = "Invalid ID format";
    } else if (err.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid token";
    } else if (err.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Token expired";
    }
  }

  // Log error with context
  logger.error(`${req.method} ${req.path} - ${statusCode} - ${message}`, {
    stack: err.stack,
    userId: (req as any).user?._id,
  });

  // Unified Error Response
  res.status(statusCode).json({
    success: false,
    message,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
