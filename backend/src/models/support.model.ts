import mongoose, { Schema, Document } from "mongoose";

export interface ISupport extends Document {
  name: string;
  email: string;
  type: "BUG" | "HELP" | "FEEDBACK";
  message: string;
  status: "PENDING" | "RESOLVED" | "IN_PROGRESS";
  isEmailSent: boolean;
  createdAt: Date;
}

const SupportSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: String, enum: ["BUG", "HELP", "FEEDBACK"], default: "BUG", required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["PENDING", "RESOLVED", "IN_PROGRESS"], default: "PENDING" },
  isEmailSent: { type: Boolean, default: false },
}, { timestamps: true });

export const SupportModel = mongoose.model<ISupport>("Support", SupportSchema);
