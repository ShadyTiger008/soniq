import { UserModel } from "../models/user.model.js";
import { CustomError } from "../middleware/errorHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthService {
  async signup(email: string, password: string, username: string) {
    // Check if user exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new CustomError("User already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new UserModel({
      email,
      password: hashedPassword,
      username
    });

    await user.save();

    // Return user without password
    const { password: _, ...userObj } = user.toObject();
    return userObj;
  }

  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new CustomError("Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new CustomError("Invalid credentials", 401);
    }

    // Generate JWT token
    const userId = String(user._id);
    const JWT_SECRET: string =
      process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

    const token = jwt.sign(
      { userId, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const userObj = user.toObject() as any;
    delete userObj.password;

    return {
      user: userObj,
      token
    };
  }

  async refreshToken(token: string) {
    const JWT_SECRET: string =
      process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        username: string;
      };

      // Generate new token
      const newToken = jwt.sign(
        {
          userId: decoded.userId,
          email: decoded.email,
          username: decoded.username
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );

      return newToken;
    } catch (error) {
      throw new CustomError("Invalid or expired token", 401);
    }
  }
}
