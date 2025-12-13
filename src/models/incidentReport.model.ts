import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// schema
const incidentReportSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reporter_name: { type: String, required: true },
    reporter_role: { type: String, enum: ["Admin", "Staff", "Trainer", "Member"], required: true },
    incident_date: { type: Date, required: true },
    location: { type: String, required: true },
    incident_type: { type: String, required: true },
    severity_level: { type: String, required: true, enum: ["low", "medium", "high"] },
    incident_description: { type: String, required: true },
    member_name: { type: String, default: null },
    member_contact: { type: String, default: null },
    witness_name: { type: String, default: null },
    witness_contact: { type: String, default: null },
    medical_attention: { type: Boolean, default: false },
    emergency_services: { type: Boolean, default: false },
    equipment_involved: { type: String },
    injury_details: { type: String },
    action_taken: { type: String },
    resolved_date: { type: Date },
    status: { type: Boolean, default: false },
    report_agreement: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// types
export type incidentReport = InferSchemaType<typeof incidentReportSchema>;
export type incidentReportDocument = HydratedDocument<incidentReport>;

// model
export const IncidentReportModel = mongoose.models.IncidentReport || model("IncidentReport", incidentReportSchema);
