import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  avatar?: string;
  message: string;
  reactions?: Array<{
    emoji: string;
    userId: mongoose.Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    username: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: ""
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    reactions: [
      {
        emoji: String,
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User"
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
chatMessageSchema.index({ roomId: 1, createdAt: -1 });

export const ChatMessageModel = mongoose.model<IChatMessage>(
  "ChatMessage",
  chatMessageSchema
);
