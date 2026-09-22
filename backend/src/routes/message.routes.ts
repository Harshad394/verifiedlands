import { Router } from "express";
import { sendMessage, getLandMessages, getAdminInbox } from "../controllers/message.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Send message (Protected for all logged in users)
router.post("/", authenticate, sendMessage);

// Get chat history for specific land listing
router.get("/land/:landId", authenticate, getLandMessages);

// Admin Inbox
router.get("/admin/inbox", authenticate, requireRole(Role.ADMIN), getAdminInbox);

export default router;
