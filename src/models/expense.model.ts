import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// schema
const expenseSchema = new Schema(
  {
    title: { type: String, required: true }, // e.g., "Bought weights"
    amount: { type: Number, required: true },
    handledBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // staff/admin
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// types
export type Expense = InferSchemaType<typeof expenseSchema>;
export type ExpenseDocument = HydratedDocument<Expense>;

// model
export const ExpenseModel = mongoose.models.Expense || model("Expense", expenseSchema);
