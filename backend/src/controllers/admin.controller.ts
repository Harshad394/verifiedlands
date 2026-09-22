import { Request, Response } from "express";
import prisma from "../config/prisma";
import {
  adminLandReviewSchema,
  adminDocReviewSchema,
  adminKycReviewSchema,
} from "../validations/admin.validation";
import { LandStatus, VerificationStatus } from "@prisma/client";

// Get lands for admin audit (filterable by status)
export const getAdminLands = async (req: Request, res: Response) => {
  try {
    const { status, search, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && Object.values(LandStatus).includes(status as LandStatus)) {
      where.status = status as LandStatus;
    }

    if (search && typeof search === "string") {
      where.OR = [
        { village: { contains: search, mode: "insensitive" } },
        { taluka: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } },
        { surveyNumber: { contains: search, mode: "insensitive" } },
        { seller: { fullName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, lands] = await Promise.all([
      prisma.land.count({ where }),
      prisma.land.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          documents: true,
          seller: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              isVerified: true,
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      lands,
    });
  } catch (error: any) {
    console.error("Get Admin Lands error:", error);
    return res.status(500).json({ message: "Failed to fetch admin lands", error: error.message });
  }
};

// Review specific property document (7/12, 8A, Sale Deed, etc.)
export const reviewLandDocument = async (req: Request, res: Response) => {
  try {
    const { landId, docId } = req.params;

    const parseResult = adminDocReviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parseResult.error.errors,
      });
    }

    const { status, rejectionReason } = parseResult.data;

    const document = await prisma.landDocument.findUnique({
      where: { id: docId },
    });

    if (!document || document.landId !== landId) {
      return res.status(404).json({ message: "Land document not found." });
    }

    const updatedDocument = await prisma.landDocument.update({
      where: { id: docId },
      data: {
        status,
        rejectionReason: status === VerificationStatus.REJECTED ? rejectionReason : null,
      },
    });

    return res.status(200).json({
      message: `Document status updated to ${status}`,
      document: updatedDocument,
    });
  } catch (error: any) {
    console.error("Review Land Document error:", error);
    return res.status(500).json({ message: "Failed to review document", error: error.message });
  }
};

// Approve or Reject entire land listing
export const reviewLandListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const parseResult = adminLandReviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parseResult.error.errors,
      });
    }

    const { status, rejectionReason, verifiedBadge } = parseResult.data;

    const land = await prisma.land.findUnique({
      where: { id },
    });

    if (!land) {
      return res.status(404).json({ message: "Land listing not found." });
    }

    const isApproved = status === LandStatus.APPROVED;

    const updatedLand = await prisma.land.update({
      where: { id },
      data: {
        status,
        verifiedBadge: verifiedBadge !== undefined ? verifiedBadge : isApproved,
        rejectionReason: status === LandStatus.REJECTED ? rejectionReason : null,
      },
      include: {
        documents: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            email: true,
            isVerified: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: `Land listing status updated to ${status}`,
      land: updatedLand,
    });
  } catch (error: any) {
    console.error("Review Land Listing error:", error);
    return res.status(500).json({ message: "Failed to review land listing", error: error.message });
  }
};

// List all pending seller KYC documents
export const getPendingKycList = async (req: Request, res: Response) => {
  try {
    const pendingKycDocs = await prisma.kycDocument.findMany({
      where: { status: VerificationStatus.PENDING },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            isVerified: true,
          },
        },
      },
    });

    return res.status(200).json({ count: pendingKycDocs.length, pendingKycDocs });
  } catch (error: any) {
    console.error("Get Pending KYC List error:", error);
    return res.status(500).json({ message: "Failed to fetch pending KYC list", error: error.message });
  }
};

// Review seller KYC document
export const reviewKycDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const parseResult = adminKycReviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parseResult.error.errors,
      });
    }

    const { status, rejectionReason } = parseResult.data;

    const kycDoc = await prisma.kycDocument.findUnique({
      where: { id },
    });

    if (!kycDoc) {
      return res.status(404).json({ message: "KYC document not found." });
    }

    const updatedKyc = await prisma.kycDocument.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === VerificationStatus.REJECTED ? rejectionReason : null,
        verifiedAt: status === VerificationStatus.APPROVED ? new Date() : null,
      },
    });

    // If document approved, check if seller now has approved KYC and mark seller as verified
    if (status === VerificationStatus.APPROVED) {
      await prisma.user.update({
        where: { id: kycDoc.userId },
        data: { isVerified: true },
      });
    }

    return res.status(200).json({
      message: `KYC Document updated to ${status}`,
      kycDocument: updatedKyc,
    });
  } catch (error: any) {
    console.error("Review KYC Document error:", error);
    return res.status(500).json({ message: "Failed to review KYC document", error: error.message });
  }
};

// Admin Dashboard Analytics & Overview Stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      pendingLands,
      approvedLands,
      rejectedLands,
      pendingKycDocs,
      totalSellers,
      totalBuyers,
      totalSiteVisits,
    ] = await Promise.all([
      prisma.land.count({ where: { status: LandStatus.PENDING_VERIFICATION } }),
      prisma.land.count({ where: { status: LandStatus.APPROVED } }),
      prisma.land.count({ where: { status: LandStatus.REJECTED } }),
      prisma.kycDocument.count({ where: { status: VerificationStatus.PENDING } }),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.siteVisitRequest.count(),
    ]);

    return res.status(200).json({
      stats: {
        pendingLands,
        approvedLands,
        rejectedLands,
        pendingKycDocs,
        totalSellers,
        totalBuyers,
        totalSiteVisits,
      },
    });
  } catch (error: any) {
    console.error("Get Dashboard Stats error:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
};
