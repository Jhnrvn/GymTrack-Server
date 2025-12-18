import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// plan feature schema
const planFeatureSchema = new Schema({
  id: { type: String, required: true },
  value: { type: String, required: true },
});

// membership schema
const membershipPlanSchema = new Schema(
  {
    plan_name: { type: String, required: true },
    plan_duration: { type: String, required: true },
    plan_price: { type: Number, required: true },
    plan_features: [planFeatureSchema],
    plan_description: { type: String, required: true },
    archived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// types
export type Membership = InferSchemaType<typeof membershipPlanSchema>;
export type MembershipDocument = HydratedDocument<Membership>;

// model
export const MembershipModel = mongoose.models.Plan || model("Membership", membershipPlanSchema);
