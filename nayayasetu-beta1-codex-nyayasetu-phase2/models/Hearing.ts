import { InferSchemaType, Schema, model, models } from "mongoose";

const HearingSchema = new Schema(
  {
    caseId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    estimatedDuration: { type: Number, required: true, min: 5 },
    readinessStatus: { type: String, enum: ["Ready", "Needs review", "Awaiting documents"], required: true },
  },
  { timestamps: true },
);

export type HearingDocument = InferSchemaType<typeof HearingSchema>;
export const HearingModel = models.Hearing || model("Hearing", HearingSchema);
