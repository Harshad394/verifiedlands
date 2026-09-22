import { Request, Response } from "express";
import prisma from "../config/prisma";
import { kycUploadSchema } from "../validations/admin.validation";
import { getPublicFileUrl } from "../middlewares/upload.middleware";
import { VerificationStatus, Role } from "@prisma/client";

export const uploadKycDocument = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }

    if (req.user.role !== Role.SELLER && req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Only sellers and admins can upload KYC documents." });
    }

    const parseResult = kycUploadSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parseResult.error.errors,
      });
    }

    const { documentType } = parseResult.data;

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "File upload is required for KYC verification." });
    }

    const documentUrl = getPublicFileUrl(req, file);

    const kycDoc = await prisma.kycDocument.create({
      data: {
        userId: req.user.id,
        documentType: documentType.toUpperCase(),
        documentUrl,
        status: VerificationStatus.PENDING,
      },
    });

    return res.status(201).json({
      message: "KYC document uploaded successfully and submitted for admin review.",
      kycDocument: kycDoc,
    });
  } catch (error: any) {
    console.error("Upload KYC Document error:", error);
    return res.status(500).json({ message: "Failed to upload KYC document", error: error.message });
  }
};

export const getMyKycStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        isVerified: true,
        kycDocuments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      isVerified: user.isVerified,
      kycDocuments: user.kycDocuments,
    });
  } catch (error: any) {
    console.error("Get My KYC Status error:", error);
    return res.status(500).json({ message: "Failed to fetch KYC status", error: error.message });
  }
};
