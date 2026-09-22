export type Role = "BUYER" | "SELLER" | "ADMIN";

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LandStatus = "DRAFT" | "PENDING_VERIFICATION" | "APPROVED" | "REJECTED" | "SOLD";

export type AreaUnit = "ACRE" | "GUNTHA" | "HECTARE" | "SQ_FT" | "SQ_MTR";

export interface LandCatalogQuery {
  state?: string;
  district?: string;
  taluka?: string;
  village?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  areaUnit?: AreaUnit | "";
  roadTouch?: boolean;
  waterAvailable?: boolean;
  electricity?: boolean;
  page?: number;
  limit?: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  role: Role;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  kycDocuments?: KycDocument[];
}

export interface KycDocument {
  id: string;
  userId: string;
  documentType: string; // e.g. "AADHAAR", "PAN"
  documentUrl: string;
  status: VerificationStatus;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  user?: Partial<User>;
}

export interface LandDocument {
  id: string;
  landId: string;
  documentType: string; // e.g. "7/12", "8A", "Sale Deed", "Mutation", "Property Card", "Map"
  documentUrl: string;
  status: VerificationStatus;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Land {
  id: string;
  sellerId: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  surveyNumber: string;
  latitude?: number | null;
  longitude?: number | null;
  price: number | string;
  totalArea: number;
  areaUnit: AreaUnit;
  roadTouch: boolean;
  waterAvailable: boolean;
  electricity: boolean;
  soilType?: string | null;
  currentCrops?: string | null;
  irrigationDetails?: string | null;
  ownershipType: string;
  encumbranceStatus: string;
  status: LandStatus;
  verifiedBadge: boolean;
  rejectionReason?: string | null;
  images: string[];
  videoUrl?: string | null;
  droneVideoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: LandDocument[];
  seller?: {
    id: string;
    fullName: string;
    email?: string;
    phoneNumber?: string | null;
    isVerified: boolean;
  };
}

export interface SiteVisitRequest {
  id: string;
  landId: string;
  buyerId: string;
  preferredDate: string;
  status: VerificationStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  land?: Partial<Land>;
  buyer?: Partial<User>;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  landContextId?: string | null;
  createdAt: string;
  sender?: Partial<User>;
  receiver?: Partial<User>;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  user?: User;
  token?: string;
  land?: Land;
  lands?: Land[];
  count?: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  stats?: {
    pendingLands: number;
    approvedLands: number;
    rejectedLands: number;
    pendingKycDocs: number;
    totalSellers: number;
    totalBuyers: number;
    totalSiteVisits: number;
  };
  errors?: Array<{ path: string[]; message: string }>;
}

export interface LandCatalogResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  lands: Land[];
}
