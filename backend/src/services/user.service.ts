import { UserModel } from "../models/user.model.js";
import { RoomModel } from "../models/room.model.js";
import { HistoryModel } from "../models/history.model.js";
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

  async getMyRooms(userId: string) {
    return RoomModel.find({ hostId: userId }).sort({ createdAt: -1 });
  }

  async getHistory(userId: string) {
    const history = await HistoryModel.find({ user: userId })
      .populate('room')
      .sort({ lastListened: -1 })
      .lean();
      
    // Filter out entries where room no longer exists
    return history.filter((h: any) => h.room);
  }
}

