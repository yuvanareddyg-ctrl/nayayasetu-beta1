import { z } from "zod";

export const signInInputSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters.")
    .max(80, "Username must not exceed 80 characters.")
    .regex(
      /^[a-zA-Z0-9_.\- ]+$/,
      "Username may only contain letters, numbers, spaces, underscores, hyphens, and dots."
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(254, "Email must not exceed 254 characters."),
});

export const userRegisterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password is too long."),
  role: z.enum(["citizen", "advocate", "judge", "admin"]).default("citizen"),
  phone: z.string().trim().max(25).optional(),
  organization: z.string().trim().max(120).optional(),
  barCouncilNumber: z.string().trim().max(50).optional(),
});

export const userLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Invalid reset token."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required."),
});

export const loginRecordQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
});
