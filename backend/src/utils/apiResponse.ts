import { Response } from "express";

/**
 * Standardized API Response structure
 */
export class ApiResponse {
  static success(res: Response, data: any, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created(res: Response, data: any, message = "Created successfully") {
    return this.success(res, data, message, 201);
  }

  static error(res: Response, message = "Error", statusCode = 500, error: any = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error || message,
    });
  }
}

/**
 * Higher-order function to wrap async controllers and catch errors
 * This eliminates the need for try/catch blocks in controllers!
 */
export const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
