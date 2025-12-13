import mongoose from "mongoose";
const { Schema, model } = mongoose;

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

const Review = mongoose.models.Review || model("Review", reviewSchema);
export default Review;
