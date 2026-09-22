import { Router } from "express";
import {
  getAdminLands,
  reviewLandDocument,
  reviewLandListing,
  getPendingKycList,
  reviewKycDocument,
  getDashboardStats,
} from "../controllers/admin.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Protect all admin endpoints with authentication and ADMIN role check
router.use(authenticate, requireRole(Role.ADMIN));

// Admin Dashboard Analytics
router.get("/dashboard/stats", getDashboardStats);

// Land Listing Audits
router.get("/lands", getAdminLands);
router.put("/lands/:id/review", reviewLandListing);
router.put("/lands/:landId/documents/:docId/review", reviewLandDocument);

// Seller KYC Verification
router.get("/kyc/pending", getPendingKycList);
router.put("/kyc/:id/review", reviewKycDocument);

export default router;
