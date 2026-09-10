import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  steamId: string;
  personaName: string;
  avatar: string;
  profileUrl: string;
  hasAuthCode: boolean;
  lastLogin: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  steamId: { type: String, required: true, unique: true },
  personaName: { type: String, default: "CS2 Player" },
  avatar: { type: String, default: "" },
  profileUrl: { type: String, default: "" },
  hasAuthCode: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
