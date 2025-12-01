import { UserModel } from "../models/user.model.js";
import { CustomError } from "../middleware/errorHandler.js";
import bcrypt from "bcryptjs";

export class AuthService {
  async signup(email: string, password: string, username: string) {
    // Check if user exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
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
      username,
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

    // TODO: Generate JWT token in production
    const userId = String(user._id);
    const token = "dummy-token-" + userId;

    const { password: _, ...userObj } = user.toObject();

    return {
      user: userObj,
      token,
    };
  }

  async refreshToken(token: string) {
    // TODO: Verify and refresh JWT token in production
    return "refreshed-" + token;
  }
}

