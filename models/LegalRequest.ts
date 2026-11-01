import { InferSchemaType, Schema, model, models } from "mongoose";

const LegalRequestSchema = new Schema(
  {
    requestNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    applicantName: { type: String, required: true, trim: true },
    applicantEmail: { type: String, required: true, trim: true },
    applicantPhone: { type: String, required: true, trim: true },
    serviceType: {
      type: String,
      enum: ["Legal Aid Representation", "Legal Advisory", "Document Scrutiny", "Bail & Custody Assistance", "Mediation"],
      required: true,
    },
    category: {
      type: String,
      enum: ["Constitutional & Rights", "Civil & Property", "Family & Matrimonial", "Criminal Defense", "Labor & Employment", "Consumer & Commercial"],
      required: true,
    },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["Standard", "Urgent", "Emergency"], default: "Standard" },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Assigned", "Hearing Scheduled", "Completed", "Rejected"],
      default: "Submitted",
    },
    assignedLawyer: {
      id: { type: String },
      name: { type: String },
      email: { type: String },
      chamber: { type: String },
    },
    documents: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    timeline: [
      {
        status: { type: String, required: true },
        note: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        author: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

LegalRequestSchema.index({ status: 1 });

export type LegalRequestDocument = InferSchemaType<typeof LegalRequestSchema>;
export const LegalRequestModel =
  models.LegalRequest || model("LegalRequest", LegalRequestSchema);
