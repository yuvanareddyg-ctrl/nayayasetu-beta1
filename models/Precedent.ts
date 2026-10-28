import { InferSchemaType, Schema, model, models } from "mongoose";

const PrecedentSchema = new Schema(
  {
    title: { type: String, required: true },
    court: { type: String, required: true },
    year: { type: Number, required: true },
    legalTopic: { type: String, required: true },
    relevanceScore: { type: Number, required: true },
    summary: { type: String, required: true },
  },
  { timestamps: true },
);

export type PrecedentDocument = InferSchemaType<typeof PrecedentSchema>;
export const PrecedentModel = models.Precedent || model("Precedent", PrecedentSchema);
