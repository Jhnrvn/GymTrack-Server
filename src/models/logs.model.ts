import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// schema
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
    membership: { type: Schema.Types.ObjectId, ref: "Membership" },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    member: { type: Schema.Types.ObjectId, ref: "Member" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
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

// types
export type Log = InferSchemaType<typeof logSchema>;
export type LogDocument = HydratedDocument<Log>;

// model
export const LogModel = mongoose.models.Logs || model("Logs", logSchema);
