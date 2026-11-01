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

export const caseUpdateSchema = caseInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "Provide at least one value to update.",
  }
);

export const draftInputSchema = z.object({
  draftType: z.enum(["Order", "Notice", "Case note", "Judgment outline"]),
  content: z.string().trim().min(20).max(30000),
  status: z.enum(["Draft", "Ready for review"]).default("Draft"),
});

export const documentCreateSchema = z.object({
  caseId: z.string().min(1, "Case ID is required."),
  filename: z.string().min(1).max(255),
  type: z.string().min(1).max(50),
  completionStatus: z.enum(["Complete", "Pending", "Incomplete"]).default("Complete"),
  isDuplicate: z.boolean().default(false),
  isMissing: z.boolean().default(false),
});

export const legalRequestInputSchema = z.object({
  applicantName: z.string().trim().min(2).max(100),
  applicantEmail: z.string().trim().toLowerCase().email(),
  applicantPhone: z.string().trim().min(6).max(25),
  serviceType: z.enum([
    "Legal Aid Representation",
    "Legal Advisory",
    "Document Scrutiny",
    "Bail & Custody Assistance",
    "Mediation",
  ]),
  category: z.enum([
    "Constitutional & Rights",
    "Civil & Property",
    "Family & Matrimonial",
    "Criminal Defense",
    "Labor & Employment",
    "Consumer & Commercial",
  ]),
  subject: z.string().trim().min(5).max(200),
  description: z.string().trim().min(20).max(5000),
  priority: z.enum(["Standard", "Urgent", "Emergency"]).default("Standard"),
  documents: z
    .array(
      z.object({
        filename: z.string(),
        url: z.string(),
        size: z.number().optional(),
        uploadedAt: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

export const consultationInputSchema = z.object({
  lawyerId: z.string().min(1),
  lawyerName: z.string().min(1),
  applicantName: z.string().trim().min(2),
  applicantEmail: z.string().trim().toLowerCase().email(),
  applicantPhone: z.string().trim().min(6),
  date: z.string().datetime({ offset: true }),
  timeSlot: z.string().min(1),
  matterSummary: z.string().trim().min(10).max(2000),
  mode: z.enum(["Video Conference", "In-Person", "Phone Consultation"]).default("Video Conference"),
});
