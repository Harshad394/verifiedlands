import { Router } from "express";
import { uploadKycDocument, getMyKycStatus } from "../controllers/kyc.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { landUpload } from "../middlewares/upload.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Upload KYC document (Aadhaar / PAN)
router.post(
  "/upload",
  authenticate,
  requireRole(Role.SELLER, Role.ADMIN),
  landUpload.single("kycDocument"),
  uploadKycDocument
);

// Get my KYC status
router.get(
  "/my-status",
  authenticate,
  requireRole(Role.SELLER, Role.ADMIN),
  getMyKycStatus
);

export default router;
