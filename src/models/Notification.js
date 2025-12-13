import mongoose from "mongoose";
const { Schema, model } = mongoose;

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
        ref: "Admin",
      },
    ],
    details: {
      type: Schema.Types.Mixed, // allows dynamic structure
      default: {},
    },
  },
  { timestamps: true }
);

const Notification = mongoose.models.Notification || model("Notification", notificationSchema);

export default Notification;
