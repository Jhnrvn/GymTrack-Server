import mongoose from "mongoose";
const { Schema, model } = mongoose;

const expenseSchema = new Schema(
  {
    title: { type: String, required: true }, // e.g., "Bought weights"
    amount: { type: Number, required: true },
    handledBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true }, // staff/admin
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Expense = mongoose.models.Expense || model("Expense", expenseSchema);
export default Expense;
