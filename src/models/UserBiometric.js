import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const UserBiometricSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    template: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserBiometric = mongoose.models.UserBiometric || model("UserBiometric", UserBiometricSchema);
export default UserBiometric;
