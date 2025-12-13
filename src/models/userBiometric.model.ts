import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
import { Schema, model } from "mongoose";

// schema
const UserBiometricSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    template: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// types
export type UserBiometric = InferSchemaType<typeof UserBiometricSchema>;
export type UserBiometricDocument = HydratedDocument<UserBiometric>;

// models
export const UserBiometricModel = mongoose.models.UserBiometric || model("UserBiometric", UserBiometricSchema);
