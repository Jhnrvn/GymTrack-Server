import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// schema
const AttendanceSchema = new Schema({
  member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
  time_in: { type: Date, required: true },
  time_out: { type: Date },
});

// types
export type Attendance = InferSchemaType<typeof AttendanceSchema>;
export type AttendanceDocument = HydratedDocument<Attendance>;

// model
export const AttendanceModel = mongoose.models.Attendance || model("Attendance", AttendanceSchema);
