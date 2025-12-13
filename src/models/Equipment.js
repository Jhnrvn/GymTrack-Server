import mongoose from "mongoose";
const { Schema, model } = mongoose;

const equipmentSchema = new Schema(
  {
    equipment_name: { type: String, required: true },
    equipment_description: { type: String, required: true },
    equipment_type: { type: String, required: true },
    equipment_condition: { type: String, required: true },
    equipment_image: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Equipment = mongoose.models.Equipment || model("Equipment", equipmentSchema);
export default Equipment;
