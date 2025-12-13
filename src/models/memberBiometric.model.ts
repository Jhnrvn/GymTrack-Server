import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// schema
const BiometricSchema = new Schema(
  {
    member_id: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    template: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// types
export type Biometric = InferSchemaType<typeof BiometricSchema>;
export type BiometricDocument = HydratedDocument<Biometric>;

export const BiometricModel = mongoose.models.Biometric || model("Biometric", BiometricSchema);
