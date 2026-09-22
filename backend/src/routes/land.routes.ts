import { Router } from "express";
import {
  createLand,
  getPublicApprovedLands,
  getMyLands,
  getLandById,
  updateLand,
  deleteLand,
} from "../controllers/land.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { uploadLandMediaAndDocs } from "../middlewares/upload.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Public buyer catalog route (filters by location, price, area, amenities)
router.get("/catalog", getPublicApprovedLands);

// Create land listing (SELLER or ADMIN) with multipart files
router.post(
  "/",
  authenticate,
  requireRole(Role.SELLER, Role.ADMIN),
  uploadLandMediaAndDocs,
  createLand
);

// Get my lands (SELLER or ADMIN)
router.get(
  "/my-lands",
  authenticate,
  requireRole(Role.SELLER, Role.ADMIN),
  getMyLands
);

// Get single land details by ID (Optional auth handled inside controller if not approved)
router.get("/:id", (req, res, next) => {
  // Pass through auth middleware if token exists, but don't reject if unauthenticated
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authenticate(req, res, next);
  }
  next();
}, getLandById);

// Update land details (SELLER or ADMIN)
router.put(
  "/:id",
  authenticate,
  requireRole(Role.SELLER, Role.ADMIN),
  uploadLandMediaAndDocs,
  updateLand
);

// Delete land listing (SELLER or ADMIN)
router.delete(
  "/:id",
  authenticate,
  requireRole(Role.SELLER, Role.ADMIN),
  deleteLand
);

export default router;
