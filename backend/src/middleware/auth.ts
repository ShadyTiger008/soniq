import { Request, Response, NextFunction } from "express";
import { CustomError } from "./errorHandler.js";
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
  res: Response,
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
      throw new CustomError("Authentication required - no token provided", 401);
    }

    if (typeof token !== "string" || token.length === 0) {
      throw new CustomError("Invalid token format", 401);
    }

    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    
    // Log in development for debugging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("JWT_SECRET set:", !!process.env.JWT_SECRET);
      console.log("Token length:", token.length);
      console.log("Token preview:", token.substring(0, 20) + "...");
    }
    
    let decoded: { userId: string; email: string; username: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; username: string };
    } catch (jwtError) {
      if (process.env.NODE_ENV === "development") {
        console.error("JWT verification error:", jwtError);
      }
      if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new CustomError(`Invalid authentication token: ${jwtError.message}`, 401);
      } else if (jwtError instanceof jwt.TokenExpiredError) {
        throw new CustomError("Token expired", 401);
      } else {
        throw new CustomError(`Token verification failed: ${jwtError instanceof Error ? jwtError.message : "Unknown error"}`, 401);
      }
    }

    if (!decoded.userId) {
      throw new CustomError("Invalid token payload - missing userId", 401);
    }

    // Fetch user from database
    const user = await UserModel.findById(decoded.userId).select("-password");
    if (!user) {
      throw new CustomError(`User not found with ID: ${decoded.userId}`, 404);
    }

    req.userId = String(user._id);
    req.user = {
      id: String(user._id),
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      // Log unexpected errors for debugging
      console.error("Authentication error:", error);
      next(new CustomError(
        `Authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        401
      ));
    }
  }
}

// Optional authentication - doesn't throw error if no token
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
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
        if (process.env.NODE_ENV === "development") {
          console.log("Optional auth failed (continuing without auth):", error instanceof Error ? error.message : "Unknown error");
        }
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

