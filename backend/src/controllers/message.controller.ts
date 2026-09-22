import { Request, Response } from "express";
import prisma from "../config/prisma";
import { sendMessageSchema } from "../validations/interaction.validation";
import { Role } from "@prisma/client";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }

    const parseResult = sendMessageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parseResult.error.errors,
      });
    }

    const { content, receiverId: inputReceiverId, landContextId } = parseResult.data;

    let targetReceiverId = inputReceiverId;

    // Strict Platform Rule: If sender is a BUYER, message MUST be routed to Admin
    if (req.user.role === Role.BUYER) {
      if (!targetReceiverId) {
        // Find an admin to route the message to
        const adminUser = await prisma.user.findFirst({
          where: { role: Role.ADMIN },
        });

        if (!adminUser) {
          return res.status(500).json({ message: "No admin account available to receive message." });
        }

        targetReceiverId = adminUser.id;
      } else {
        // Verify target receiver is an admin
        const targetUser = await prisma.user.findUnique({
          where: { id: targetReceiverId },
        });

        if (!targetUser || targetUser.role !== Role.ADMIN) {
          return res.status(403).json({
            message: "Direct messaging with sellers is disabled for buyer safety. Messages must be sent to Admin.",
          });
        }
      }
    }

    if (!targetReceiverId) {
      return res.status(400).json({ message: "Recipient user ID is required." });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId: targetReceiverId,
        content,
        landContextId,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, role: true },
        },
        receiver: {
          select: { id: true, fullName: true, role: true },
        },
      },
    });

    return res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error: any) {
    console.error("Send Message error:", error);
    return res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

// Get chat messages for a specific land context
export const getLandMessages = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { landId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        landContextId: landId,
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id },
        ],
      },
      include: {
        sender: {
          select: { id: true, fullName: true, role: true },
        },
        receiver: {
          select: { id: true, fullName: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({ count: messages.length, messages });
  } catch (error: any) {
    console.error("Get Land Messages error:", error);
    return res.status(500).json({ message: "Failed to fetch land chat history", error: error.message });
  }
};

// Admin Inbox: List all buyer inquiry threads
export const getAdminInbox = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden. Admin access required." });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { receiverId: req.user.id },
          { senderId: req.user.id },
        ],
      },
      include: {
        sender: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        receiver: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ count: messages.length, messages });
  } catch (error: any) {
    console.error("Get Admin Inbox error:", error);
    return res.status(500).json({ message: "Failed to fetch admin inbox", error: error.message });
  }
};
