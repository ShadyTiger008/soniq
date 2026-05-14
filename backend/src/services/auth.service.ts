import { UserModel } from "../models/user.model.js";
import { BadRequestError, UnauthorizedError } from "../utils/errors.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { firebaseAdmin } from "../config/firebase.admin.js";

export class AuthService {
  async signup(email: string, password: string, username: string) {
    // Check if user exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new BadRequestError("User already exists");
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
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.password) {
      throw new UnauthorizedError("Please log in with Google for this account");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
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

  async googleLogin(idToken: string) {
    try {
      // Verify Firebase ID token
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      const { email, uid, name, picture } = decodedToken;

      if (!email) {
        throw new BadRequestError("Email not provided by Google");
      }

      // Check if user exists by googleId or email
      let user = await UserModel.findOne({
        $or: [{ googleId: uid }, { email }]
      });

      if (!user) {
        // Create new user if doesn't exist
        // Generate a random username if name is not available
        const baseUsername = name ? name.toLowerCase().replace(/\s+/g, "_") : email.split("@")[0];
        let username = baseUsername;
        
        // Ensure username is unique
        let userExists = await UserModel.findOne({ username });
        let counter = 1;
        while (userExists) {
          username = `${baseUsername}${counter}`;
          userExists = await UserModel.findOne({ username });
          counter++;
        }

        user = new UserModel({
          email,
          googleId: uid,
          username,
          avatar: picture || "",
          role: "user"
        });

        await user.save();
      } else if (!user.googleId) {
        // If user exists but doesn't have googleId linked, link it
        user.googleId = uid;
        if (!user.avatar && picture) {
          user.avatar = picture;
        }
        await user.save();
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
    } catch (error: any) {
      if (error.code === "auth/id-token-expired") {
        throw new UnauthorizedError("Google ID token expired");
      }
      throw new UnauthorizedError(error.message || "Invalid Google ID token");
    }
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
      throw new UnauthorizedError("Invalid or expired token");
    }
  }
}
