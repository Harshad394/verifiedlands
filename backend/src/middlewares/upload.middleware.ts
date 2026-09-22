import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Base uploads directory
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Subdirectories
const IMAGES_DIR = path.join(UPLOADS_DIR, "images");
const VIDEOS_DIR = path.join(UPLOADS_DIR, "videos");
const DOCUMENTS_DIR = path.join(UPLOADS_DIR, "documents");

// Ensure upload directories exist
[UPLOADS_DIR, IMAGES_DIR, VIDEOS_DIR, DOCUMENTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Determine destination folder based on field name or mime type
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === "images") {
      cb(null, IMAGES_DIR);
    } else if (file.fieldname === "video" || file.fieldname === "droneVideo") {
      cb(null, VIDEOS_DIR);
    } else {
      // All property documents (doc_7_12, doc_8A, etc.)
      cb(null, DOCUMENTS_DIR);
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizeFieldName = file.fieldname.replace(/[^a-zA-Z0-0_-]/g, "");
    cb(null, `${sanitizeFieldName}-${uniqueSuffix}${ext}`);
  },
});

// File type filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedImageMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const allowedVideoMimes = ["video/mp4", "video/mkv", "video/quicktime", "video/webm"];
  const allowedDocMimes = [
    ...allowedImageMimes,
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (file.fieldname === "images" && allowedImageMimes.includes(file.mimetype)) {
    cb(null, true);
  } else if ((file.fieldname === "video" || file.fieldname === "droneVideo") && allowedVideoMimes.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.fieldname.startsWith("doc_") && allowedDocMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file format for field '${file.fieldname}'. MIME type '${file.mimetype}' not allowed.`));
  }
};

// Multer upload instance
export const landUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max limit (allows video files)
  },
});

// Export configured upload fields for Land creation & editing
export const uploadLandMediaAndDocs = landUpload.fields([
  { name: "images", maxCount: 10 },
  { name: "video", maxCount: 1 },
  { name: "droneVideo", maxCount: 1 },
  { name: "doc_7_12", maxCount: 1 },
  { name: "doc_8A", maxCount: 1 },
  { name: "doc_sale_deed", maxCount: 1 },
  { name: "doc_mutation", maxCount: 1 },
  { name: "doc_property_card", maxCount: 1 },
  { name: "doc_owner_aadhaar", maxCount: 1 },
  { name: "doc_pan", maxCount: 1 },
  { name: "doc_map", maxCount: 1 },
]);

// Helper utility to construct relative public URL from file path
export const getPublicFileUrl = (req: Request, file: Express.Multer.File): string => {
  const protocol = req.protocol;
  const host = req.get("host");
  let subfolder = "documents";
  if (file.fieldname === "images") subfolder = "images";
  if (file.fieldname === "video" || file.fieldname === "droneVideo") subfolder = "videos";

  return `${protocol}://${host}/uploads/${subfolder}/${file.filename}`;
};
