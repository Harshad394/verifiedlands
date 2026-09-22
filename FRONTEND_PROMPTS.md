# VerifiedLand Frontend Build Prompts

These prompts were written after analyzing the current Express/Prisma backend. Use them sequentially with an AI coding assistant, or use the final "full build" prompt if you want one larger implementation pass.

## Backend Contract Summary

Base API URL in development: `http://localhost:5000`

Authentication uses JWT in the `Authorization: Bearer <token>` header. Auth responses return `{ token, user }`. User roles are `BUYER`, `SELLER`, and `ADMIN`.

Main backend entities:

- `User`: `id`, `email`, `phoneNumber`, `fullName`, `role`, `isVerified`
- `Land`: location, price, area, amenities, ownership, encumbrance, status, media, documents, seller
- `LandDocument`: `documentType`, `documentUrl`, `status`, `rejectionReason`
- `KycDocument`: seller verification document with `PENDING`, `APPROVED`, or `REJECTED`
- `SiteVisitRequest`: buyer request for approved land, reviewed by admin
- `Message`: protected chat/inquiry, buyers are routed to admin

Enums to mirror in the frontend:

```ts
type Role = "BUYER" | "SELLER" | "ADMIN";
type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";
type LandStatus = "DRAFT" | "PENDING_VERIFICATION" | "APPROVED" | "REJECTED" | "SOLD";
type AreaUnit = "ACRE" | "GUNTHA" | "HECTARE" | "SQ_FT" | "SQ_MTR";
```

Important backend caveat: `POST /api/kyc/upload` uses `landUpload.single("kycDocument")`, but the current multer file filter does not allow field name `kycDocument`. KYC upload UI should be built against that endpoint, but the backend filter likely needs to be fixed to allow this field.

## Prompt 1: Project Setup And API Foundation

```text
You are building the frontend for VerifiedLand, a land buying and selling marketplace backed by an existing Express/Prisma API.

Use the existing Next.js app in `frontend/` with Next 16, React 19, Tailwind CSS 4, TypeScript, Axios, and lucide-react. Read `frontend/AGENTS.md` first because this Next version has breaking changes and local docs may be needed.

Create a production-quality app foundation:

- Configure app metadata for VerifiedLand.
- Replace the starter page with a real application shell.
- Add an environment-based API base URL, using `NEXT_PUBLIC_API_BASE_URL` and defaulting to `http://localhost:5000`.
- Create a typed Axios API client that automatically attaches `Authorization: Bearer <token>` when logged in.
- Create shared TypeScript types for Role, VerificationStatus, LandStatus, AreaUnit, User, Land, LandDocument, KycDocument, SiteVisitRequest, Message, and common API responses.
- Add helper utilities for formatting INR prices, dates, area units, status labels, image fallbacks, and API error messages.
- Add reusable UI primitives using Tailwind and lucide-react: Button, Input, Select, Textarea, Checkbox/Switch, Badge, StatusBadge, FileInput, Modal/Dialog, Tabs, EmptyState, LoadingSkeleton, Toast or inline alert.
- Keep the UI operational and dashboard-like, not a marketing landing page. Avoid fake data. Use loading, empty, and error states for real API calls.

Backend endpoints available:

- `GET /health`
- Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/create-admin`, `/api/auth/me`
- Lands: `/api/lands/catalog`, `/api/lands/:id`, `/api/lands`, `/api/lands/my-lands`
- KYC: `/api/kyc/upload`, `/api/kyc/my-status`
- Admin: `/api/admin/dashboard/stats`, `/api/admin/lands`, `/api/admin/lands/:id/review`, `/api/admin/lands/:landId/documents/:docId/review`, `/api/admin/kyc/pending`, `/api/admin/kyc/:id/review`
- Site visits: `/api/site-visits`, `/api/site-visits/my-requests`, `/api/site-visits/admin/all`, `/api/site-visits/admin/:id/review`
- Messages: `/api/messages`, `/api/messages/land/:landId`, `/api/messages/admin/inbox`
```

## Prompt 2: Authentication And Role Routing

```text
Build the authentication flow for VerifiedLand.

Backend contract:

- `POST /api/auth/signup`
  Body: `{ email, password, fullName, phoneNumber?, role? }`
  `role` can only be `BUYER` or `SELLER`.
- `POST /api/auth/login`
  Body: `{ email, password }`
- `POST /api/auth/create-admin`
  Body: `{ email, password, fullName, phoneNumber?, adminSecret }`
  Treat this as a development or internal setup page, not a normal public CTA.
- `GET /api/auth/me`
  Requires bearer token and returns `{ user }` with KYC documents.

Implement:

- Login page.
- Signup page with role segmented control: Buyer or Seller.
- Auth state stored in a small client-side auth provider or store using localStorage for token and user.
- On app load, call `/api/auth/me` when a token exists.
- Logout clears local state and redirects to login.
- Route guards:
  - Public: catalog, land detail for approved listings, login, signup.
  - Buyer: buyer dashboard, site visit history, messages.
  - Seller: seller dashboard, KYC, create listing, my listings.
  - Admin: admin dashboard, verification queues, admin inbox, site visit review.
- After login/signup route users by role:
  - BUYER to `/buyer`
  - SELLER to `/seller`
  - ADMIN to `/admin`
- Show useful validation messages from backend Zod errors.
```

## Prompt 3: Public Buyer Catalog

```text
Build the public land catalog for VerifiedLand.

Backend contract:

`GET /api/lands/catalog`

Query parameters:

- `state`, `district`, `taluka`, `village`
- `minPrice`, `maxPrice`
- `minArea`, `maxArea`
- `areaUnit`: `ACRE`, `GUNTHA`, `HECTARE`, `SQ_FT`, `SQ_MTR`
- `roadTouch`, `waterAvailable`, `electricity`: booleans as `true` or `false`
- `page`, `limit`

Response:

`{ total, page, limit, totalPages, lands }`

Implement:

- `/catalog` page with searchable, filterable approved land listings.
- Dense but polished filter sidebar/sheet with location, price, area, unit, and amenity toggles.
- Listing cards showing image, village/taluka/district/state, price, area, survey number, amenities, verified badge, seller verification badge, and action button.
- Pagination using backend `page`, `limit`, and `totalPages`.
- Mobile filter drawer.
- Empty state when no land matches filters.
- Preserve filters in URL search params.
- Do not expose seller contact details. Backend public payload only includes seller id, fullName, and isVerified.
```

## Prompt 4: Land Detail, Buyer Inquiry, And Site Visit

```text
Build the land detail page and buyer actions.

Backend contract:

- `GET /api/lands/:id`
  Optional bearer token. Unapproved lands are visible only to the seller who owns them or an admin.
- `POST /api/site-visits`
  Requires BUYER or ADMIN.
  Body: `{ landId, preferredDate, notes? }`
- `POST /api/messages`
  Requires auth.
  Body: `{ content, receiverId?, landContextId? }`
  For BUYER users, omit `receiverId` so the backend routes the inquiry to admin.
- `GET /api/messages/land/:landId`
  Requires auth. Returns messages for the logged-in user around that land.

Implement:

- `/lands/[id]` detail page.
- Media gallery for `images`, `videoUrl`, and `droneVideoUrl`.
- Detail sections: location, survey number, price, total area/unit, road touch, water, electricity, soil type, crops, irrigation, ownership type, encumbrance status, status, rejection reason where relevant.
- If latitude/longitude exist, show a simple map link or embedded map area that does not require a new dependency.
- Buyer actions:
  - Request site visit modal with date/time and notes.
  - Send inquiry modal/message panel. For buyers, send `{ content, landContextId }`.
- If not logged in, buyer actions prompt login.
- Show document list only when included by backend. Public catalog only returns approved documents, while detail can return all documents depending on access.
- Never show seller phone/email on public buyer pages.
```

## Prompt 5: Buyer Dashboard

```text
Build the buyer dashboard.

Backend contract:

- `GET /api/site-visits/my-requests`
  Requires BUYER or ADMIN.
  Returns `{ count, siteVisits }` with land summary.
- `GET /api/messages/land/:landId`
  Requires auth.
- `POST /api/messages`
  Requires auth.

Implement:

- `/buyer` dashboard home with quick links to catalog, site visit requests, and recent inquiries.
- `/buyer/site-visits` table/list with land image, location, preferred date, status, notes, and created date.
- Status filters for `PENDING`, `APPROVED`, `REJECTED` handled client-side if needed because buyer endpoint has no status query.
- A land-specific message thread view reachable from visit rows and listing detail.
- Buyer cannot message sellers directly. UI copy and behavior should make inquiries go through VerifiedLand admin.
```

## Prompt 6: Seller KYC And Seller Dashboard

```text
Build the seller dashboard and KYC pages.

Backend contract:

- `GET /api/kyc/my-status`
  Requires SELLER or ADMIN.
  Returns `{ isVerified, kycDocuments }`.
- `POST /api/kyc/upload`
  Requires SELLER or ADMIN.
  Multipart form fields:
  - text field `documentType`, examples: `AADHAAR`, `PAN`
  - file field `kycDocument`

Important: the current backend multer filter likely rejects `kycDocument`, so build the UI against this contract but surface a friendly error if upload fails.

Implement:

- `/seller` dashboard with KYC status, listing count/status summary, and actions.
- `/seller/kyc` with Aadhaar/PAN upload form, upload progress if simple to support, and a history table of KYC documents.
- KYC document cards showing document type, status, rejection reason, verifiedAt, and uploaded date.
- Clear callout that seller verification is required for trust, but do not block listing creation unless backend enforces it. The current backend allows seller/admin listing creation by role only.
```

## Prompt 7: Seller Land Listing Management

```text
Build seller land listing creation and management.

Backend contract:

- `POST /api/lands`
  Requires SELLER or ADMIN.
  Multipart form data text fields:
  - `village`, `taluka`, `district`, `state`, `surveyNumber`
  - `latitude?`, `longitude?`
  - `price`, `totalArea`, `areaUnit`
  - `roadTouch`, `waterAvailable`, `electricity`
  - `soilType?`, `currentCrops?`, `irrigationDetails?`
  - `ownershipType`, `encumbranceStatus`
  Multipart files:
  - `images` max 10
  - `video` max 1
  - `droneVideo` max 1
  - `doc_7_12`, `doc_8A`, `doc_sale_deed`, `doc_mutation`, `doc_property_card`, `doc_owner_aadhaar`, `doc_pan`, `doc_map`
- `GET /api/lands/my-lands`
  Requires SELLER or ADMIN. Returns `{ count, lands }`.
- `PUT /api/lands/:id`
  Requires SELLER or ADMIN. Current backend effectively updates text fields and resets seller-edited listing status to `PENDING_VERIFICATION`.
- `DELETE /api/lands/:id`
  Requires SELLER or ADMIN.

Implement:

- `/seller/lands` list with filters by status and search over location/survey number.
- `/seller/lands/new` multi-section form:
  - Location
  - Price and area
  - Amenities and agriculture
  - Ownership and encumbrance
  - Media
  - Required/supporting documents
- Use `FormData`; append booleans as `"true"` or `"false"` and numbers as strings.
- Show document checklist using exact backend field names.
- After submit, show backend success message and route to my lands.
- `/seller/lands/[id]/edit` for text-field edits. Make it clear that media/document replacement is not currently supported by the backend update controller unless that backend feature is added.
- Listing detail/status view for sellers, including document review statuses and rejection reasons.
```

## Prompt 8: Admin Dashboard And Land Verification

```text
Build the admin dashboard and land verification workflow.

Backend contract:

- `GET /api/admin/dashboard/stats`
  Returns `stats`: `pendingLands`, `approvedLands`, `rejectedLands`, `pendingKycDocs`, `totalSellers`, `totalBuyers`, `totalSiteVisits`
- `GET /api/admin/lands`
  Query: `status?`, `search?`, `page?`, `limit?`
  Returns `{ total, page, limit, totalPages, lands }`
- `PUT /api/admin/lands/:id/review`
  Body: `{ status, rejectionReason?, verifiedBadge? }`
  `status`: `APPROVED`, `REJECTED`, or `PENDING_VERIFICATION`
  Rejection requires `rejectionReason`.
- `PUT /api/admin/lands/:landId/documents/:docId/review`
  Body: `{ status, rejectionReason? }`
  `status`: `PENDING`, `APPROVED`, or `REJECTED`
  Rejection requires `rejectionReason`.

Implement:

- `/admin` dashboard with stat tiles and queues.
- `/admin/lands` audit table with status tabs, search, pagination, seller info, location, price, area, document counts, and listing status.
- `/admin/lands/[id]` review page with full land detail, seller info, media preview, documents preview links, per-document approve/reject controls, and whole-listing approve/reject controls.
- Require rejection reason in the UI before sending rejected status.
- Add verified badge toggle when approving a listing.
- After each review mutation, refresh data and show success/error feedback.
```

## Prompt 9: Admin KYC Verification

```text
Build admin seller KYC review.

Backend contract:

- `GET /api/admin/kyc/pending`
  Returns `{ count, pendingKycDocs }`, each with `user`.
- `PUT /api/admin/kyc/:id/review`
  Body: `{ status, rejectionReason? }`
  `status`: `PENDING`, `APPROVED`, or `REJECTED`
  Rejection requires `rejectionReason`.
  Approving a KYC document marks the seller `isVerified = true`.

Implement:

- `/admin/kyc` page listing pending KYC documents.
- Show seller full name, email, phone, current verification status, document type, document link/preview, created date.
- Approve and reject actions with confirmation.
- Rejection modal requiring a reason.
- Refresh queue after review.
```

## Prompt 10: Admin Site Visits And Inbox

```text
Build admin operations pages for site visits and messages.

Backend contract:

- `GET /api/site-visits/admin/all`
  Requires ADMIN.
  Query: `status?` as `PENDING`, `APPROVED`, or `REJECTED`.
  Returns `{ count, siteVisits }` with land, seller, and buyer summary.
- `PUT /api/site-visits/admin/:id/review`
  Body: `{ status, notes? }`
- `GET /api/messages/admin/inbox`
  Returns `{ count, messages }`
- `POST /api/messages`
  Body: `{ content, receiverId, landContextId? }`

Implement:

- `/admin/site-visits` page with tabs by status, buyer/seller contact context, land summary, preferred date, notes, and approve/reject/pending controls.
- `/admin/inbox` page showing all messages involving the admin.
- Group or visually cluster messages by `landContextId` and participant where practical, because backend returns flat messages.
- Admin reply form that sends to selected participant using `receiverId`.
- Preserve the platform safety rule: buyer-seller direct messaging should not be introduced in UI.
```

## Prompt 11: Quality, Accessibility, And Integration Pass

```text
Run a frontend quality pass for VerifiedLand.

Check and fix:

- TypeScript correctness.
- ESLint issues.
- Mobile and desktop layouts for catalog, detail, seller forms, and admin tables.
- Text overflow in buttons, cards, table cells, and badges.
- All forms show loading, disabled, success, and error states.
- Auth token is attached to protected requests.
- 401/403 responses route or message correctly.
- Multipart uploads use exact backend field names.
- Rejection forms require reasons before API submission.
- Public buyer pages never show seller email or phone.
- Currency, dates, status labels, and area units are readable.
- `npm run lint` and `npm run build` pass in `frontend/`.

If backend is running, manually test:

- Signup/login as buyer and seller.
- Catalog fetch.
- Land detail fetch.
- Seller land creation via multipart form.
- Seller KYC upload, noting that backend may need a multer filter fix for `kycDocument`.
- Admin stats, land review, KYC review, site visit review, inbox.
```

## One-Shot Full Build Prompt

```text
Build the complete VerifiedLand frontend in the existing `frontend/` Next.js app by analyzing and matching the backend API already present in this repository.

Use Next 16, React 19, TypeScript, Tailwind CSS 4, Axios, and lucide-react. Read `frontend/AGENTS.md` before coding because this Next version has local breaking-change guidance.

The product is a secure land marketplace where sellers submit land with documents, admins verify sellers/listings/documents, and buyers browse only approved lands, request visits, and message admin instead of contacting sellers directly.

Implement:

1. App foundation
   - VerifiedLand metadata and app shell.
   - `NEXT_PUBLIC_API_BASE_URL`, default `http://localhost:5000`.
   - Typed Axios client with bearer token.
   - Shared types for Role, VerificationStatus, LandStatus, AreaUnit, User, Land, LandDocument, KycDocument, SiteVisitRequest, Message.
   - Reusable Tailwind UI components and status badges.

2. Auth
   - Login, signup as BUYER/SELLER, internal admin creation page.
   - Persist token/user in localStorage, refresh with `GET /api/auth/me`.
   - Role-based route guards and role-specific redirects.

3. Buyer experience
   - Public `/catalog` using `GET /api/lands/catalog` with filters for state, district, taluka, village, price, area, areaUnit, roadTouch, waterAvailable, electricity, page, limit.
   - `/lands/[id]` detail using `GET /api/lands/:id`.
   - Buyer request site visit using `POST /api/site-visits` with `{ landId, preferredDate, notes? }`.
   - Buyer inquiry using `POST /api/messages` with `{ content, landContextId }`, omitting receiverId so backend routes to admin.
   - `/buyer/site-visits` from `GET /api/site-visits/my-requests`.

4. Seller experience
   - `/seller` dashboard with KYC and listing summary.
   - `/seller/kyc` using `GET /api/kyc/my-status` and multipart `POST /api/kyc/upload` with `documentType` and file field `kycDocument`.
   - Note in code/UI error handling that backend may currently reject `kycDocument` because multer filter needs to allow that field.
   - `/seller/lands`, `/seller/lands/new`, `/seller/lands/[id]/edit`.
   - Land create must submit FormData to `POST /api/lands` with exact fields:
     `village`, `taluka`, `district`, `state`, `surveyNumber`, `latitude?`, `longitude?`, `price`, `totalArea`, `areaUnit`, `roadTouch`, `waterAvailable`, `electricity`, `soilType?`, `currentCrops?`, `irrigationDetails?`, `ownershipType`, `encumbranceStatus`, `images`, `video`, `droneVideo`, `doc_7_12`, `doc_8A`, `doc_sale_deed`, `doc_mutation`, `doc_property_card`, `doc_owner_aadhaar`, `doc_pan`, `doc_map`.
   - My lands from `GET /api/lands/my-lands`; update text fields via `PUT /api/lands/:id`; delete via `DELETE /api/lands/:id`.

5. Admin experience
   - `/admin` stats from `GET /api/admin/dashboard/stats`.
   - `/admin/lands` from `GET /api/admin/lands?status&search&page&limit`.
   - Land/document review:
     - `PUT /api/admin/lands/:id/review` with `{ status, rejectionReason?, verifiedBadge? }`.
     - `PUT /api/admin/lands/:landId/documents/:docId/review` with `{ status, rejectionReason? }`.
   - `/admin/kyc` from `GET /api/admin/kyc/pending`, review with `PUT /api/admin/kyc/:id/review`.
   - `/admin/site-visits` from `GET /api/site-visits/admin/all?status`, review with `PUT /api/site-visits/admin/:id/review`.
   - `/admin/inbox` from `GET /api/messages/admin/inbox`, reply with `POST /api/messages`.

Design requirements:

- Build the real usable app as the first screen, not a landing page.
- Use restrained, trust-focused marketplace styling suitable for land transactions in India: clear tables, forms, document checklists, verification statuses, and location-first listing cards.
- Do not expose seller phone/email on public buyer pages.
- Include loading, empty, error, and success states everywhere.
- Use mobile-responsive layouts.
- Avoid fake data. Fetch from backend and show empty states when no data exists.
- Make all mutation forms disable while submitting and show backend validation messages.

Verify with `npm run lint` and `npm run build` inside `frontend/`, and fix any issues.
```
