import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createLandSchema, updateLandSchema, landQuerySchema } from "../validations/land.validation";
import { getPublicFileUrl } from "../middlewares/upload.middleware";
import { LandStatus, Role } from "@prisma/client";

export const createLand = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }

    // Only SELLER or ADMIN can create land listings
    if (req.user.role !== Role.SELLER && req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Only sellers and admins can create land listings." });
    }

    // Validate text payload
    const parseResult = createLandSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parseResult.error.errors,
      });
    }

    const landData = parseResult.data;

    // Process uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const images: string[] = [];
    let videoUrl: string | undefined;
    let droneVideoUrl: string | undefined;

    const documentEntries: { documentType: string; documentUrl: string }[] = [];

    if (files) {
      // Process images
      if (files.images && files.images.length > 0) {
        files.images.forEach((file) => {
          images.push(getPublicFileUrl(req, file));
        });
      }

      // Process videos
      if (files.video && files.video.length > 0) {
        videoUrl = getPublicFileUrl(req, files.video[0]);
      }
      if (files.droneVideo && files.droneVideo.length > 0) {
        droneVideoUrl = getPublicFileUrl(req, files.droneVideo[0]);
      }

      // Process documents map
      const docTypeMapping: { [key: string]: string } = {
        doc_7_12: "7/12",
        doc_8A: "8A",
        doc_sale_deed: "Sale Deed",
        doc_mutation: "Mutation",
        doc_property_card: "Property Card",
        doc_owner_aadhaar: "Aadhaar",
        doc_pan: "PAN",
        doc_map: "Map",
      };

      Object.entries(docTypeMapping).forEach(([fieldKey, docTypeName]) => {
        if (files[fieldKey] && files[fieldKey].length > 0) {
          documentEntries.push({
            documentType: docTypeName,
            documentUrl: getPublicFileUrl(req, files[fieldKey][0]),
          });
        }
      });
    }

    // Create Land in Prisma
    const newLand = await prisma.land.create({
      data: {
        sellerId: req.user.id,
        village: landData.village,
        taluka: landData.taluka,
        district: landData.district,
        state: landData.state,
        surveyNumber: landData.surveyNumber,
        latitude: landData.latitude,
        longitude: landData.longitude,
        price: landData.price,
        totalArea: landData.totalArea,
        areaUnit: landData.areaUnit,
        roadTouch: landData.roadTouch,
        waterAvailable: landData.waterAvailable,
        electricity: landData.electricity,
        soilType: landData.soilType,
        currentCrops: landData.currentCrops,
        irrigationDetails: landData.irrigationDetails,
        ownershipType: landData.ownershipType,
        encumbranceStatus: landData.encumbranceStatus,
        status: LandStatus.PENDING_VERIFICATION,
        images,
        videoUrl,
        droneVideoUrl,
        documents: {
          create: documentEntries.map((doc) => ({
            documentType: doc.documentType,
            documentUrl: doc.documentUrl,
          })),
        },
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

    return res.status(201).json({
      message: "Land listing submitted successfully and is pending admin verification.",
      land: newLand,
    });
  } catch (error: any) {
    console.error("Create Land error:", error);
    return res.status(500).json({ message: "Failed to create land listing", error: error.message });
  }
};

export const getPublicApprovedLands = async (req: Request, res: Response) => {
  try {
    const parseResult = landQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid Query Parameters",
        errors: parseResult.error.errors,
      });
    }

    const {
      state,
      district,
      taluka,
      village,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      areaUnit,
      roadTouch,
      waterAvailable,
      electricity,
      page = 1,
      limit = 10,
    } = parseResult.data;

    const where: any = {
      status: LandStatus.APPROVED,
      ...(state && { state: { contains: state, mode: "insensitive" } }),
      ...(district && { district: { contains: district, mode: "insensitive" } }),
      ...(taluka && { taluka: { contains: taluka, mode: "insensitive" } }),
      ...(village && { village: { contains: village, mode: "insensitive" } }),
      ...(areaUnit && { areaUnit }),
      ...(roadTouch !== undefined && { roadTouch }),
      ...(waterAvailable !== undefined && { waterAvailable }),
      ...(electricity !== undefined && { electricity }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),
      ...(minArea !== undefined || maxArea !== undefined
        ? {
            totalArea: {
              ...(minArea !== undefined && { gte: minArea }),
              ...(maxArea !== undefined && { lte: maxArea }),
            },
          }
        : {}),
    };

    const skip = (page - 1) * limit;

    const [total, lands] = await Promise.all([
      prisma.land.count({ where }),
      prisma.land.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          documents: {
            where: { status: "APPROVED" },
            select: {
              id: true,
              documentType: true,
              documentUrl: true,
              status: true,
            },
          },
          seller: {
            select: {
              id: true,
              fullName: true,
              isVerified: true,
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      lands,
    });
  } catch (error: any) {
    console.error("Get Public Approved Lands error:", error);
    return res.status(500).json({ message: "Failed to fetch catalog lands", error: error.message });
  }
};

export const getMyLands = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const lands = await prisma.land.findMany({
      where: { sellerId: req.user.id },
      include: {
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ count: lands.length, lands });
  } catch (error: any) {
    console.error("Get My Lands error:", error);
    return res.status(500).json({ message: "Failed to fetch seller lands", error: error.message });
  }
};

export const getLandById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const land = await prisma.land.findUnique({
      where: { id },
      include: {
        documents: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            isVerified: true,
          },
        },
      },
    });

    if (!land) {
      return res.status(404).json({ message: "Land listing not found." });
    }

    // Access control: if not approved, only seller or admin can view
    if (land.status !== LandStatus.APPROVED) {
      if (!req.user || (req.user.id !== land.sellerId && req.user.role !== Role.ADMIN)) {
        return res.status(403).json({ message: "Access restricted. This land listing is not yet approved." });
      }
    }

    return res.status(200).json({ land });
  } catch (error: any) {
    console.error("Get Land By Id error:", error);
    return res.status(500).json({ message: "Failed to fetch land listing", error: error.message });
  }
};

export const updateLand = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const existingLand = await prisma.land.findUnique({ where: { id } });

    if (!existingLand) {
      return res.status(404).json({ message: "Land listing not found." });
    }

    if (existingLand.sellerId !== req.user.id && req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden. You can only edit your own listings." });
    }

    const parseResult = updateLandSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: parseResult.error.errors,
      });
    }

    const updateData = parseResult.data;

    const updatedLand = await prisma.land.update({
      where: { id },
      data: {
        ...updateData,
        // Reset status to pending verification if updated by seller
        status: req.user.role === Role.ADMIN ? existingLand.status : LandStatus.PENDING_VERIFICATION,
      },
      include: {
        documents: true,
      },
    });

    return res.status(200).json({
      message: "Land listing updated successfully",
      land: updatedLand,
    });
  } catch (error: any) {
    console.error("Update Land error:", error);
    return res.status(500).json({ message: "Failed to update land listing", error: error.message });
  }
};

export const deleteLand = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const existingLand = await prisma.land.findUnique({ where: { id } });

    if (!existingLand) {
      return res.status(404).json({ message: "Land listing not found." });
    }

    if (existingLand.sellerId !== req.user.id && req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden. You can only delete your own listings." });
    }

    await prisma.land.delete({ where: { id } });

    return res.status(200).json({ message: "Land listing deleted successfully." });
  } catch (error: any) {
    console.error("Delete Land error:", error);
    return res.status(500).json({ message: "Failed to delete land listing", error: error.message });
  }
};
