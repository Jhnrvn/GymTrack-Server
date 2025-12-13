import mongoose from "mongoose";
const { Schema, model } = mongoose;

const logSchema = new Schema(
  {
    action: {
      type: String,
      enum: [
        "LOGIN",
        "LOGOUT",
        "ADD",
        "UPDATE",
        "DELETE",
        "TIME IN",
        "TIME OUT",
        "SELL",
        "RESTOCK",
        "ARCHIVE",
        "UNARCHIVE",
        "EXPENSE",
        "APPROVE",
        "REMOVE",
        "CONFIRM",
        "CANCEL",
        "REPORT",
        "RESOLVE",
      ],
      required: true,
    },
    membership: { type: Schema.Types.ObjectId, ref: "Plan" },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    member: { type: Schema.Types.ObjectId, ref: "Member" },
    user: { type: Schema.Types.ObjectId, ref: "Admin" },
    equipment: { type: Schema.Types.ObjectId, ref: "Equipment" },
    message: { type: String, required: true },
    amount: { type: Number },
    status: { type: Boolean, required: true },
    proof: { type: String },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.models.Logs || model("Logs", logSchema);
export default Log;
