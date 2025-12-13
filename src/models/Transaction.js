import mongoose from "mongoose";
const { Schema, model } = mongoose;

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
    membership_plan: { type: Schema.Types.ObjectId, ref: "Plan" },
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

const Transaction =
  mongoose.models.Transaction || model("Transaction", transactionSchema);

export default Transaction;

