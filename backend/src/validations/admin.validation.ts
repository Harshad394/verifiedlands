import { z } from "zod";
import { VerificationStatus, LandStatus } from "@prisma/client";

export const adminLandReviewSchema = z.object({
  status: z.enum([LandStatus.APPROVED, LandStatus.REJECTED, LandStatus.PENDING_VERIFICATION], {
    errorMap: () => ({ message: "Status must be APPROVED, REJECTED, or PENDING_VERIFICATION" }),
  }),
  rejectionReason: z.string().optional(),
  verifiedBadge: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.status === LandStatus.REJECTED && (!data.rejectionReason || data.rejectionReason.trim() === "")) {
      return false;
    }
    return true;
  },
  {
    message: "A rejection reason must be provided when rejecting a land listing.",
    path: ["rejectionReason"],
  }
);

export const adminDocReviewSchema = z.object({
  status: z.enum([VerificationStatus.APPROVED, VerificationStatus.REJECTED, VerificationStatus.PENDING], {
    errorMap: () => ({ message: "Status must be APPROVED, REJECTED, or PENDING" }),
  }),
  rejectionReason: z.string().optional(),
}).refine(
  (data) => {
    if (data.status === VerificationStatus.REJECTED && (!data.rejectionReason || data.rejectionReason.trim() === "")) {
      return false;
    }
    return true;
  },
  {
    message: "A rejection reason must be provided when rejecting a document.",
    path: ["rejectionReason"],
  }
);

export const kycUploadSchema = z.object({
  documentType: z.string().min(1, "Document type is required (e.g. AADHAAR, PAN)"),
});

export const adminKycReviewSchema = z.object({
  status: z.enum([VerificationStatus.APPROVED, VerificationStatus.REJECTED, VerificationStatus.PENDING], {
    errorMap: () => ({ message: "Status must be APPROVED, REJECTED, or PENDING" }),
  }),
  rejectionReason: z.string().optional(),
}).refine(
  (data) => {
    if (data.status === VerificationStatus.REJECTED && (!data.rejectionReason || data.rejectionReason.trim() === "")) {
      return false;
    }
    return true;
  },
  {
    message: "A rejection reason must be provided when rejecting a KYC document.",
    path: ["rejectionReason"],
  }
);
