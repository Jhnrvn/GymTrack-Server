import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// schema
const orderSchema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    proof_uploaded: { type: Boolean, default: false },
    proof: { type: String },
    product_quantity: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    transaction_method: { type: String, required: true },
    status: { type: String, enum: ["Confirmed", "Pending", "Cancelled"], default: "Pending" },
  },
  {
    timestamps: true,
  }
);

// types
export type Order = InferSchemaType<typeof orderSchema>;
export type OrderDocument = HydratedDocument<Order>;

// model
export const OrderModel = mongoose.models.PendingOrder || model("Orders", orderSchema);
