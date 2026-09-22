import { z } from "zod";
import { AreaUnit, LandStatus } from "@prisma/client";

// Helper transformers for multipart/form-data & query string values
const stringToBoolean = z.preprocess((val) => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    if (val.toLowerCase() === "true" || val === "1") return true;
    if (val.toLowerCase() === "false" || val === "0") return false;
  }
  return val;
}, z.boolean());

const optionalStringToBoolean = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    if (val.toLowerCase() === "true" || val === "1") return true;
    if (val.toLowerCase() === "false" || val === "0") return false;
  }
  return val;
}, z.boolean().optional());

const stringToNumber = z.preprocess((val) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) return parsed;
  }
  return val;
}, z.number());

const optionalStringToNumber = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) return parsed;
  }
  return val;
}, z.number().optional());

// Land Creation Validation Schema
export const createLandSchema = z.object({
  // Location Details
  village: z.string().min(1, "Village name is required"),
  taluka: z.string().min(1, "Taluka name is required"),
  district: z.string().min(1, "District name is required"),
  state: z.string().min(1, "State name is required"),
  surveyNumber: z.string().min(1, "Survey number is required"),
  latitude: optionalStringToNumber,
  longitude: optionalStringToNumber,

  // Land Characteristics
  price: stringToNumber.pipe(z.number().positive("Price must be greater than 0")),
  totalArea: stringToNumber.pipe(z.number().positive("Total area must be greater than 0")),
  areaUnit: z.nativeEnum(AreaUnit, {
    errorMap: () => ({ message: "Invalid Area Unit. Must be one of: ACRE, GUNTHA, HECTARE, SQ_FT, SQ_MTR" }),
  }),
  roadTouch: stringToBoolean.default(false),
  waterAvailable: stringToBoolean.default(false),
  electricity: stringToBoolean.default(false),
  soilType: z.string().optional(),
  currentCrops: z.string().optional(),
  irrigationDetails: z.string().optional(),
  ownershipType: z.string().min(1, "Ownership type is required (e.g. Single Owner, Joint Venture)"),
  encumbranceStatus: z.string().min(1, "Encumbrance status is required (e.g. No Encumbrance, Mortgaged)"),
});

// Land Update Validation Schema
export const updateLandSchema = createLandSchema.partial();

// Land Search & Filter Query Schema (For Buyer & Admin Catalog search)
export const landQuerySchema = z.object({
  state: z.string().optional(),
  district: z.string().optional(),
  taluka: z.string().optional(),
  village: z.string().optional(),
  minPrice: optionalStringToNumber,
  maxPrice: optionalStringToNumber,
  minArea: optionalStringToNumber,
  maxArea: optionalStringToNumber,
  areaUnit: z.nativeEnum(AreaUnit).optional(),
  roadTouch: optionalStringToBoolean,
  waterAvailable: optionalStringToBoolean,
  electricity: optionalStringToBoolean,
  status: z.nativeEnum(LandStatus).optional(),
  page: optionalStringToNumber.default(1),
  limit: optionalStringToNumber.default(10),
});
