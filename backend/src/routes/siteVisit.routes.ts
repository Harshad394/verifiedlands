import { Router } from "express";
import {
  createSiteVisitRequest,
  getMySiteVisitRequests,
  getAdminSiteVisitRequests,
  reviewSiteVisitRequest,
} from "../controllers/siteVisit.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Buyer submits site visit request
router.post(
  "/",
  authenticate,
  requireRole(Role.BUYER, Role.ADMIN),
  createSiteVisitRequest
);

// Buyer gets site visit history
router.get(
  "/my-requests",
  authenticate,
  requireRole(Role.BUYER, Role.ADMIN),
  getMySiteVisitRequests
);

// Admin lists all site visits
router.get(
  "/admin/all",
  authenticate,
  requireRole(Role.ADMIN),
  getAdminSiteVisitRequests
);

// Admin reviews site visit request
router.put(
  "/admin/:id/review",
  authenticate,
  requireRole(Role.ADMIN),
  reviewSiteVisitRequest
);

export default router;
