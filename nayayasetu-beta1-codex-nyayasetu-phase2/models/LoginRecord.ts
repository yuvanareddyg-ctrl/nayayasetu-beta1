import { InferSchemaType, Schema, model, models } from "mongoose";

const LoginRecordSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    loginAt: { type: Date, required: true, default: () => new Date() },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true },
);

// Index so admin queries (sorted by loginAt desc) are fast
LoginRecordSchema.index({ loginAt: -1 });
LoginRecordSchema.index({ email: 1 });

export type LoginRecordDocument = InferSchemaType<typeof LoginRecordSchema>;
export const LoginRecordModel =
  models.LoginRecord || model("LoginRecord", LoginRecordSchema);
