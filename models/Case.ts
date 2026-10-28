import { InferSchemaType, Schema, model, models } from "mongoose";

const CaseSchema = new Schema(
  {
    caseNumber: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    jurisdiction: { type: String, required: true, trim: true },
    parties: { type: [String], required: true },
    hearingDate: { type: Date, required: true },
    status: { type: String, enum: ["Listed", "Under Review", "Reserved", "Disposed"], default: "Listed" },
    priority: { type: String, enum: ["Standard", "Priority", "Urgent"], default: "Standard" },
    assignedJudge: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export type CaseDocument = InferSchemaType<typeof CaseSchema>;
export const CaseModel = models.Case || model("Case", CaseSchema);
