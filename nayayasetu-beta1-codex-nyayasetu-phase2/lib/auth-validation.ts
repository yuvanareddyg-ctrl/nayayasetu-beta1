import { z } from "zod";

export const signInInputSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters.")
    .max(80, "Username must not exceed 80 characters.")
    .regex(
      /^[a-zA-Z0-9_.\- ]+$/,
      "Username may only contain letters, numbers, spaces, underscores, hyphens, and dots.",
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(254, "Email must not exceed 254 characters."),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required."),
});

export const loginRecordQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
});
