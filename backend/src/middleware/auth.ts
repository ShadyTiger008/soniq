import { Request, Response, NextFunction } from "express";
import { CustomError } from "./errorHandler.js";

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// Dummy authentication middleware - replace with JWT in production
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract token from header or cookie
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.cookies?.authToken;

    if (!token) {
      throw new CustomError("Authentication required", 401);
    }

    // TODO: Verify JWT token in production
    // For now, dummy authentication
    // In production, decode and verify JWT token here
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // req.userId = decoded.userId;
    // req.user = decoded.user;

    // Dummy user for development
    req.userId = "dummy-user-id";
    req.user = {
      id: "dummy-user-id",
      email: "user@example.com",
      username: "dummyuser",
    };

    next();
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(new CustomError("Invalid authentication token", 401));
    }
  }
}

// Optional authentication - doesn't throw error if no token
export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.cookies?.authToken;

    if (token) {
      // TODO: Verify JWT token in production
      req.userId = "dummy-user-id";
      req.user = {
        id: "dummy-user-id",
        email: "user@example.com",
        username: "dummyuser",
      };
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

