import { z } from "zod";
import { VerificationStatus } from "@prisma/client";

export const createSiteVisitSchema = z.object({
  landId: z.string().uuid("Invalid Land ID format"),
  preferredDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format. Must be a valid date string.",
  }),
  notes: z.string().optional(),
});

export const reviewSiteVisitSchema = z.object({
  status: z.enum([VerificationStatus.APPROVED, VerificationStatus.REJECTED, VerificationStatus.PENDING], {
    errorMap: () => ({ message: "Status must be APPROVED, REJECTED, or PENDING" }),
  }),
  notes: z.string().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty"),
  receiverId: z.string().uuid().optional(),
  landContextId: z.string().uuid().optional(),
});
