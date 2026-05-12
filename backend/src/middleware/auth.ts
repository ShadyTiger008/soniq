import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, NotFoundError, ApiError } from "../utils/errors.js";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// JWT authentication middleware
export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from header or cookie
    const authHeader = req.headers.authorization;
    let tokenFromHeader: string | null = null;
    
    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        tokenFromHeader = authHeader.replace("Bearer ", "").trim();
      } else {
        // Also accept token without Bearer prefix
        tokenFromHeader = authHeader.trim();
      }
    }
    
    const tokenFromCookie = req.cookies?.authToken;
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      throw new UnauthorizedError("Authentication required - no token provided");
    }

    if (typeof token !== "string" || token.length === 0) {
      throw new UnauthorizedError("Invalid token format");
    }

    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    
    let decoded: { userId: string; email: string; username: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; username: string };
    } catch (jwtError) {
      if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError(`Invalid authentication token: ${jwtError.message}`);
      } else if (jwtError instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Token expired");
      } else {
        throw new UnauthorizedError(`Token verification failed: ${jwtError instanceof Error ? jwtError.message : "Unknown error"}`);
      }
    }

    if (!decoded.userId) {
      throw new UnauthorizedError("Invalid token payload - missing userId");
    }

    // Fetch user from database
    const user = await UserModel.findById(decoded.userId).select("-password");
    if (!user) {
      throw new NotFoundError(`User not found with ID: ${decoded.userId}`);
    }

    req.userId = String(user._id);
    req.user = {
      id: String(user._id),
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      // Log unexpected errors for debugging
      console.error("Authentication error:", error);
      next(new UnauthorizedError(
        `Authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`
      ));
    }
  }
}

// Optional authentication - doesn't throw error if no token
export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from header or cookie (same logic as authenticate)
    const authHeader = req.headers.authorization;
    let tokenFromHeader: string | null = null;
    
    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        tokenFromHeader = authHeader.replace("Bearer ", "").trim();
      } else {
        tokenFromHeader = authHeader.trim();
      }
    }
    
    const tokenFromCookie = req.cookies?.authToken;
    const token = tokenFromHeader || tokenFromCookie;

    if (token && typeof token === "string" && token.length > 0) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; username: string };
        
        if (decoded.userId) {
          const user = await UserModel.findById(decoded.userId).select("-password");
          if (user) {
            req.userId = String(user._id);
            req.user = {
              id: String(user._id),
              email: user.email,
              username: user.username,
            };
          }
        }
      } catch (error) {
        // Invalid token, continue without authentication
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

