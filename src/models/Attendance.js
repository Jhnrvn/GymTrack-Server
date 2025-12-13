import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AttendanceSchema = new Schema({
  member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
  time_in: { type: Date, required: true },
  time_out: { type: Date },
});

const Attendance = mongoose.models.Attendance || model("Attendance", AttendanceSchema);

export default Attendance;
