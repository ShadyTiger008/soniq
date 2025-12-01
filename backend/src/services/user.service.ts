import { UserModel } from "../models/user.model.js";
import { CustomError } from "../middleware/errorHandler.js";

export class UserService {
  async getUserById(id: string) {
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    return user;
  }

  async updateUser(userId: string, updateData: any) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    
    return user;
  }
}

