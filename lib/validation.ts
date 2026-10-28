import { z } from "zod";

export const caseInputSchema = z.object({
  caseNumber: z.string().trim().min(3).max(80),
  title: z.string().trim().min(5).max(240),
  jurisdiction: z.string().trim().min(3).max(160),
  parties: z.array(z.string().trim().min(1).max(160)).min(2).max(12),
  hearingDate: z.string().datetime({ offset: true }),
  status: z.enum(["Listed", "Under Review", "Reserved", "Disposed"]),
  priority: z.enum(["Standard", "Priority", "Urgent"]),
  assignedJudge: z.string().trim().min(3).max(120),
});

export const caseUpdateSchema = caseInputSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "Provide at least one value to update.",
});

export const draftInputSchema = z.object({
  draftType: z.enum(["Order", "Notice", "Case note", "Judgment outline"]),
  content: z.string().trim().min(20).max(30000),
  status: z.enum(["Draft", "Ready for review"]).default("Draft"),
});
