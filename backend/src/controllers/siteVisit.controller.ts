import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createSiteVisitSchema, reviewSiteVisitSchema } from "../validations/interaction.validation";
import { LandStatus, VerificationStatus } from "@prisma/client";

// Buyer submits site visit request
export const createSiteVisitRequest = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }

    const parseResult = createSiteVisitSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parseResult.error.errors,
      });
    }

    const { landId, preferredDate, notes } = parseResult.data;

    // Check if land exists and is approved
    const land = await prisma.land.findUnique({
      where: { id: landId },
    });

    if (!land) {
      return res.status(404).json({ message: "Land listing not found." });
    }

    if (land.status !== LandStatus.APPROVED) {
      return res.status(400).json({ message: "Site visits can only be requested for approved land listings." });
    }

    const siteVisit = await prisma.siteVisitRequest.create({
      data: {
        landId,
        buyerId: req.user.id,
        preferredDate: new Date(preferredDate),
        notes,
        status: VerificationStatus.PENDING,
      },
      include: {
        land: {
          select: {
            id: true,
            village: true,
            taluka: true,
            district: true,
            state: true,
            surveyNumber: true,
            price: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Site visit request submitted successfully. Admin will contact you shortly.",
      siteVisit,
    });
  } catch (error: any) {
    console.error("Create Site Visit Request error:", error);
    return res.status(500).json({ message: "Failed to request site visit", error: error.message });
  }
};

// Buyer views their submitted site visit requests
export const getMySiteVisitRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const siteVisits = await prisma.siteVisitRequest.findMany({
      where: { buyerId: req.user.id },
      include: {
        land: {
          select: {
            id: true,
            village: true,
            taluka: true,
            district: true,
            state: true,
            surveyNumber: true,
            price: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ count: siteVisits.length, siteVisits });
  } catch (error: any) {
    console.error("Get My Site Visit Requests error:", error);
    return res.status(500).json({ message: "Failed to fetch site visit requests", error: error.message });
  }
};

// Admin lists all site visit requests
export const getAdminSiteVisitRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status && Object.values(VerificationStatus).includes(status as VerificationStatus)) {
      where.status = status as VerificationStatus;
    }

    const siteVisits = await prisma.siteVisitRequest.findMany({
      where,
      include: {
        land: {
          select: {
            id: true,
            village: true,
            taluka: true,
            district: true,
            state: true,
            surveyNumber: true,
            price: true,
            seller: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ count: siteVisits.length, siteVisits });
  } catch (error: any) {
    console.error("Get Admin Site Visit Requests error:", error);
    return res.status(500).json({ message: "Failed to fetch site visit requests for admin", error: error.message });
  }
};

// Admin updates status of site visit request
export const reviewSiteVisitRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const parseResult = reviewSiteVisitSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parseResult.error.errors,
      });
    }

    const { status, notes } = parseResult.data;

    const existingVisit = await prisma.siteVisitRequest.findUnique({
      where: { id },
    });

    if (!existingVisit) {
      return res.status(404).json({ message: "Site visit request not found." });
    }

    const updatedVisit = await prisma.siteVisitRequest.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined && { notes }),
      },
      include: {
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: `Site visit request status updated to ${status}`,
      siteVisit: updatedVisit,
    });
  } catch (error: any) {
    console.error("Review Site Visit Request error:", error);
    return res.status(500).json({ message: "Failed to review site visit request", error: error.message });
  }
};
