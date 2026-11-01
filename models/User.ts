import { InferSchemaType, Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["citizen", "advocate", "judge", "admin"],
      default: "citizen",
    },
    phone: { type: String, trim: true },
    organization: { type: String, trim: true },
    barCouncilNumber: { type: String, trim: true },
    avatar: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });

export type UserDocument = InferSchemaType<typeof UserSchema>;
export const UserModel = models.User || model("User", UserSchema);
