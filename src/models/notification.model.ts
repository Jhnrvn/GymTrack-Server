import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// schema
const notificationSchema = new Schema(
  {
    role_target: { type: [String], enum: ["Admin", "Staff"], default: [] },
    user: { type: Schema.Types.ObjectId, ref: "Member" }, // target user
    title: { type: String, required: true }, // short title
    message: { type: String, required: true }, // detailed text
    type: {
      type: String,
      enum: [
        "Membership",
        "Payment",
        "Product",
        "System",
        "Order",
        "Reminder",
        "Custom",
        "Notice",
        "Attendance",
        "Incident report",
      ],
      default: "custom",
    },
    isRead: { type: Boolean, default: false },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    details: {
      type: Schema.Types.Mixed, // allows dynamic structure
      default: {},
    },
  },
  { timestamps: true }
);

// types
export type Notification = InferSchemaType<typeof notificationSchema>;
export type NotificationDocument = HydratedDocument<Notification>;

// model
export const NotificationModel = mongoose.models.Notification || model("Notification", notificationSchema);
