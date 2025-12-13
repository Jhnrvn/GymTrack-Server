import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// schema
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

// types
export type Equipment = InferSchemaType<typeof equipmentSchema>;
export type EquipmentDocument = HydratedDocument<Equipment>;

// model
export const EquipmentModel = mongoose.models.Equipment || model("Equipment", equipmentSchema);
