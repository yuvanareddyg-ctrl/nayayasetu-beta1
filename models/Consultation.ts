import { InferSchemaType, Schema, model, models } from "mongoose";

const ConsultationSchema = new Schema(
  {
    consultationNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true },
    lawyerId: { type: String, required: true },
    lawyerName: { type: String, required: true },
    applicantName: { type: String, required: true },
    applicantEmail: { type: String, required: true },
    applicantPhone: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    matterSummary: { type: String, required: true },
    mode: { type: String, enum: ["Video Conference", "In-Person", "Phone Consultation"], default: "Video Conference" },
    status: {
      type: String,
      enum: ["Confirmed", "Rescheduled", "Completed", "Cancelled"],
      default: "Confirmed",
    },
    meetingLink: { type: String },
  },
  { timestamps: true }
);

ConsultationSchema.index({ userId: 1 });
ConsultationSchema.index({ lawyerId: 1 });

export type ConsultationDocument = InferSchemaType<typeof ConsultationSchema>;
export const ConsultationModel =
  models.Consultation || model("Consultation", ConsultationSchema);
