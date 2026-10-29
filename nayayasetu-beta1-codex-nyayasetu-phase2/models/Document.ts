import { InferSchemaType, Schema, model, models } from "mongoose";

const DocumentSchema = new Schema(
  {
    caseId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    type: { type: String, required: true },
    uploadedDate: { type: Date, required: true },
    completionStatus: { type: String, enum: ["Complete", "Pending", "Incomplete"], required: true },
    isDuplicate: { type: Boolean, default: false },
    isMissing: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type DocumentModelType = InferSchemaType<typeof DocumentSchema>;
export const DocumentModel = models.Document || model("Document", DocumentSchema);
