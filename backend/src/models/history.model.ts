import mongoose, { Schema, Document } from "mongoose";

export interface IHistory extends Document {
  user: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  lastListened: Date;
}

const historySchema = new Schema<IHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    lastListened: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure a user only has one entry per room, and for fast lookups
historySchema.index({ user: 1, room: 1 }, { unique: true });
// Index for sorting by recently listened
historySchema.index({ user: 1, lastListened: -1 });

export const HistoryModel = mongoose.model<IHistory>("History", historySchema);
