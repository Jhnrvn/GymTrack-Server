import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// schema
const transactionSchema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },

    // What type of transaction this is
    type: {
      type: String,
      enum: ["Product", "Membership"],
      required: true,
    },

    // Product purchase
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    product_quantity: { type: Number, default: 0 },

    // Membership payment
    membership_plan: { type: Schema.Types.ObjectId, ref: "Membership" },
    startDate: { type: Date },
    endDate: { type: Date },
    discount_rate: { type: Number, default: 0 },

    // Common fields
    total_amount: { type: Number, required: true },
    transaction_method: { type: String, required: true }, // e.g., "Cash", "GCash"
    handled_by: { type: Schema.Types.ObjectId, ref: "Admin", required: true },

    // Optional status field
    status: {
      type: String,
      enum: ["Paid", "Pending", "Failed", "Refunded"],
      default: "Paid",
    },
  },
  { timestamps: true }
);

// types
export type Transaction = InferSchemaType<typeof transactionSchema>;
export type TransactionDocument = HydratedDocument<Transaction>;

// models
export const TransactionModel = mongoose.models.Transaction || model("Transaction", transactionSchema);
