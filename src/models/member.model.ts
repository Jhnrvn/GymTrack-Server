import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// member plan history schema
const planHistorySchema = new Schema({
  plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
  price: { type: Number, required: true, min: 0 },
  discountRate: { type: Number, default: 0, min: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
});

// member schema
const memberSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  age: { type: Number, min: 14, default: 14 },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, required: false },
  password: { type: String },
  changePassword_code: { type: String },
  gender: { type: String, enum: ["Male", "Female"] },
  profile_picture: { type: String },
  isAgreed: { type: Boolean, default: false },
  member_type: { type: String, enum: ["Member", "Trainer"], default: "Member" },

  currentPlan: {
    transaction: { type: Schema.Types.ObjectId, ref: "Transaction" },
    plan: { type: Schema.Types.ObjectId, ref: "Plan" },
    startDate: { type: Date },
    endDate: { type: Date },
    discount_rate: { type: Number, min: 0 },
    price: { type: Number, min: 0 },
  },

  planHistory: [planHistorySchema],

  isEnrolled: { type: Boolean, default: false },
  enrolledAt: { type: Date, default: Date.now },
});

// Enforce unique firstName + lastName combination
memberSchema.index({ firstName: 1, lastName: 1 }, { unique: true });

// virtual to populate member attendance
memberSchema.virtual("attendance", {
  ref: "Attendance",
  localField: "_id",
  foreignField: "member",
});

// virtual to populate transactions
memberSchema.virtual("transactions", {
  ref: "Transaction",
  localField: "_id",
  foreignField: "member",
});

memberSchema.set("toObject", { virtuals: true });
memberSchema.set("toJSON", { virtuals: true });

// types
export type Member = InferSchemaType<typeof memberSchema>;
export type MemberDocument = HydratedDocument<Member>;

// model
export const MemberModel = mongoose.models.Member || model("Member", memberSchema);
