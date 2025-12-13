import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// schema
const reviewSchema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    rating: { type: Number, required: true },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// types
export type Review = InferSchemaType<typeof reviewSchema>;
export type ReviewDocument = HydratedDocument<Review>;

// model
export const ReviewModel = mongoose.models.Review || model("Review", reviewSchema);
