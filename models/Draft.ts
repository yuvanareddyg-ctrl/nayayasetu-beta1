import { InferSchemaType, Schema, model, models } from "mongoose";

const DraftSchema = new Schema(
  {
    caseId: { type: String, required: true, index: true },
    draftType: { type: String, enum: ["Order", "Notice", "Case note", "Judgment outline"], required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ["Draft", "Ready for review"], default: "Draft" },
    createdDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export type DraftDocument = InferSchemaType<typeof DraftSchema>;
export const DraftModel = models.Draft || model("Draft", DraftSchema);
