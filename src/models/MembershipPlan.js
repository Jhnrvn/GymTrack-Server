import mongoose from "mongoose";
const { Schema, model } = mongoose;

const planFeatureSchema = new Schema({
  id: { type: String, required: true },
  value: { type: String, required: true },
});

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

const MembershipPlan = mongoose.models.Plan || model("Plan", membershipPlanSchema);

export default MembershipPlan;
