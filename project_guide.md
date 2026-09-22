# VerifiedLand Project Guide & Architecture Roadmap

Welcome to the **VerifiedLand** project guide. This document serves as the architectural blueprint and execution roadmap for building the VerifiedLand platform, a secure marketplace for land transactions featuring admin-verified listings.

---

## 1. Project Rating & Critique

### **Project Rating: 9/10**
The concept is **highly viable and commercially strong**. 

#### **Why this project is excellent:**
1. **Solves a Real-World Problem:** Land transactions (especially in South Asian regions like India, implied by terms like `7/12 extract`, `8A`, `Taluka`, `Survey Number`) are notorious for ownership disputes, double-selling, and documentation fraud.
2. **Monetization and Safety via Disintermediation:** By keeping communication strictly between **Buyer ↔ Admin** and **Admin ↔ Seller**, you solve two massive problems:
   - **Safety:** Buyers are protected from malicious/fraudulent sellers.
   - **Monetization:** Sellers and buyers cannot easily bypass the platform to avoid commissions, ensuring a stable business model.
3. **Trust as a Product:** The "Verified Badge" backed by official document checking (7/12, 8A, Sale Deed, Mutation) makes the platform a trusted authority.

---

## 2. Key Suggestions & Enhancements

To make this application a premium, enterprise-grade platform, consider the following enhancements:

### **A. Advanced Mapping & Boundaries (GeoJSON)**
*   **Current State:** Just showing a Google Maps / OpenStreetMap pin.
*   **Enhancement:** Allow sellers to upload/draw the exact coordinates (polygon) of their land. You can store this as GeoJSON in PostgreSQL (using PostGIS extension) and render the boundaries on the map. This helps buyers see the exact shape of the land relative to roads.

### **B. Automated Document Watermarking**
*   **Enhancement:** To protect sellers from identity theft and document misuse, automatically watermark uploaded PDFs/images (Aadhaar, Sale Deeds) with a semi-transparent "FOR VERIFIEDLAND VERIFICATION ONLY" overlay.

### **C. Document Verification Workflow States**
*   Instead of a simple binary "Verified / Not Verified", implement granular document tracking:
    *   `PENDING_UPLOAD`
    *   `SUBMITTED`
    *   `UNDER_REVIEW`
    *   `APPROVED`
    *   `REJECTED` (with rejection reason comment box for the admin).

### **D. Communication Hub (Intercom-Style Admin Chat)**
*   Since buyers can only message the Admin, create a unified ticket/chat dashboard for the Admin:
    *   **Buyer Tickets:** Buyer enquires about Land X.
    *   **Seller Tickets:** Admin asks Seller for additional documents.
    *   This keeps the conversation threaded around specific land listings.

---

## 3. Technology Stack & Directory Structure

```
VerifiedLand/
├── backend/                # Node.js + Express + TypeScript + Prisma
│   ├── prisma/             # Schema & migrations
│   ├── src/
│   │   ├── config/         # Database, Cloudinary, JWT config
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Auth, Validation, Error handlers
│   │   ├── routes/         # Express routing
│   │   ├── services/       # Business logic (e.g. storage, notifications)
│   │   ├── utils/          # Helpers (Zod schemas, helpers)
│   │   ├── app.ts          # Express App setup
│   │   └── server.ts       # Entry point
│   ├── tsconfig.json
│   └── package.json
└── frontend/               # Next.js + Tailwind + Shadcn UI (To be created)
```

---

## 4. Proposed Database Schema (Prisma ORM)

Here is a comprehensive database design using PostgreSQL. It models users, land listings, verification documents, site visits, messages, and commissions.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  BUYER
  SELLER
  ADMIN
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum LandStatus {
  DRAFT
  PENDING_VERIFICATION
  APPROVED           // Available on public buyer catalog
  REJECTED
  SOLD
}

enum AreaUnit {
  ACRE
  GUNTHA
  HECTARE
  SQ_FT
  SQ_MTR
}

enum CropType {
  CASH_CROP
  FOOD_GRAIN
  HORTICULTURE
  NONE
}

model User {
  id                String             @id @default(uuid())
  email             String             @unique
  phoneNumber       String?            @unique
  passwordHash      String
  fullName          String
  role              Role               @default(BUYER)
  isVerified        Boolean            @default(false) // KYC status for seller
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  // Relationships
  lands             Land[]             @relation("SellerLands")
  kycDocuments      KycDocument[]
  messagesSent      Message[]          @relation("SenderMessages")
  messagesReceived  Message[]          @relation("ReceiverMessages")
  siteVisits        SiteVisitRequest[] @relation("BuyerSiteVisits")
}

model KycDocument {
  id                String             @id @default(uuid())
  userId            String
  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  documentType      String             // "AADHAAR", "PAN"
  documentUrl       String             // S3/Cloudinary URL
  status            VerificationStatus @default(PENDING)
  rejectionReason   String?
  verifiedAt        DateTime?
  createdAt         DateTime           @default(now())
}

model Land {
  id                String             @id @default(uuid())
  sellerId          String
  seller            User               @relation("SellerLands", fields: [sellerId], references: [id])
  
  // Location Details
  village           String
  taluka            String
  district          String
  state             String
  surveyNumber      String
  latitude          Float?
  longitude         Float?
  
  // Land Characteristics
  price             Decimal            @db.Decimal(15, 2)
  totalArea         Float
  areaUnit          AreaUnit
  roadTouch         Boolean            @default(false)
  waterAvailable    Boolean            @default(false)
  electricity       Boolean            @default(false)
  soilType          String?
  currentCrops      String?
  irrigationDetails String?
  ownershipType     String             // "Single Owner", "Joint Venture", etc.
  encumbranceStatus String             // "No Encumbrance", "Mortgaged", etc.
  
  // Status and Verification
  status            LandStatus         @default(PENDING_VERIFICATION)
  verifiedBadge     Boolean            @default(false)
  rejectionReason   String?
  
  // Media
  images            String[]           // Array of Cloudinary URLs
  videoUrl          String?            // Video walkthrough
  droneVideoUrl     String?            // Optional drone video
  
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  // Relationships
  documents         LandDocument[]
  siteVisits        SiteVisitRequest[]
  commissions       Commission[]
}

model LandDocument {
  id                String             @id @default(uuid())
  landId            String
  land              Land               @relation(fields: [landId], references: [id], onDelete: Cascade)
  documentType      String             // "7/12", "8A", "Sale Deed", "Mutation", "Property Card", "Map"
  documentUrl       String
  status            VerificationStatus @default(PENDING)
  rejectionReason   String?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
}

model SiteVisitRequest {
  id                String             @id @default(uuid())
  landId            String
  land              Land               @relation(fields: [landId], references: [id])
  buyerId           String
  buyer             User               @relation("BuyerSiteVisits", fields: [buyerId], references: [id])
  preferredDate     DateTime
  status            VerificationStatus @default(PENDING)
  notes             String?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
}

model Message {
  id                String             @id @default(uuid())
  senderId          String
  sender            User               @relation("SenderMessages", fields: [senderId], references: [id])
  receiverId        String
  receiver          User               @relation("ReceiverMessages", fields: [receiverId], references: [id])
  content           String
  landContextId     String?            // Link to a specific land query
  createdAt         DateTime           @default(now())
}

model Commission {
  id                String             @id @default(uuid())
  landId            String
  land              Land               @relation(fields: [landId], references: [id])
  dealAmount        Decimal            @db.Decimal(15, 2)
  commissionRate    Float              // Percentage, e.g. 2.0
  commissionEarned  Decimal            @db.Decimal(15, 2)
  paymentStatus     String             // "PENDING", "PAID"
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
}
```

---

## 5. Development Phases & Implementation Roadmap

### **Phase 1: Backend Setup & Authentication (Current Phase)**
*   Initialize TypeScript Node.js backend.h
*   Setup Prisma configurations, Docker PostgreSQL (or local instance).
*   Create authentication controllers (Signup, Login, Admin accounts, JWT tokens).
*   Implement JWT verification middleware.

### **Phase 2: Seller Listing & Media Uploads**
*   Create endpoints for Land creation.
*   Configure file uploads (integration with Cloudinary or S3 for images, videos, and PDFs).
*   Create forms validation with Zod (matching all required land parameters and document checklist).

### **Phase 3: Admin Review Panels & KYC**
*   Expose endpoints for Admin to fetch listings in states: `PENDING_VERIFICATION`, `APPROVED`, `REJECTED`.
*   Implement approval/rejection logic. If rejected, record the exact reason for document failure.
*   Implement seller KYC verification (Aadhaar / PAN check) status transitions.

### **Phase 4: Buyer Directory & Search Engine**
*   Implement public endpoints for verified lands catalog.
*   Allow filtering by state, district, village, price, land area, water/electricity access, and road-touch status.
*   Hide seller details entirely in public payloads.

### **Phase 5: Lead & Visit Scheduling**
*   Create API for buyers to submit a `Request Site Visit` and send messages regarding specific land cards.
*   Route these messages directly to Admin chat panels.

### **Phase 6: Analytics & Commission Tracker**
*   Provide admin with statistics: total views, active site visits, pending commissions, verified seller growth.
