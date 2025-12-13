import mongoose from "mongoose";
const { Schema, model } = mongoose;

const BiometricSchema = new Schema(
  {
    member_id: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    template: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Biometric = mongoose.models.Biometric || model("Biometric", BiometricSchema);
export default Biometric;
