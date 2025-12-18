import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// schema
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    isBlocked: { type: Boolean, default: false },
    isPermitted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verification_token: { type: String },
    profile_picture: { type: String, default: null },
    lastUpdated: { type: Date },
    changePassword_code: { type: String, default: null },
    name: {
      firstName: { type: String },
      lastName: { type: String },
    },
    password: { type: String, required: true },
    isFirstLogin: { type: Boolean, default: true },
    isAgree: { type: Boolean, default: false },
    role: { type: String, enum: ["Admin", "Staff"], default: "Staff" },
    isEnrolled: { type: Boolean, default: false },
    enrolledAt: { type: Date, default: Date.now, required: false },
    active: { type: Boolean, default: false },
    last_update: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// types
export type BaseUser = InferSchemaType<typeof userSchema>;
export type User = Omit<BaseUser, "changePassword_code"> & { changePassword_code: string | null };
export type UserDocument = HydratedDocument<User>;

// models
export const UserModel = mongoose.models.User || model<User>("User", userSchema);
