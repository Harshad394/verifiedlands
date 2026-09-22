import { LandStatus, VerificationStatus, AreaUnit } from "@/types";

// Class names joiner helper
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Format price into INR (₹) Lakhs / Crores / standard locale
export function formatINR(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "₹0";

  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Cr`;
  }
  if (num >= 100000) {
    const lakh = num / 100000;
    return `₹${lakh.toFixed(lakh % 1 === 0 ? 0 : 2)} Lakh`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

// Format date into human-readable representation
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

// Format Area Unit label
export function formatArea(area: number, unit: AreaUnit): string {
  const unitMap: Record<AreaUnit, string> = {
    ACRE: "Acres",
    GUNTHA: "Gunthas",
    HECTARE: "Hectares",
    SQ_FT: "Sq. Ft.",
    SQ_MTR: "Sq. Mtr.",
  };
  return `${area} ${unitMap[unit] || unit}`;
}

// Get Badge Props (Color, Label) for Land & Document status
export function getStatusBadgeProps(status: LandStatus | VerificationStatus): {
  label: string;
  variant: "success" | "warning" | "danger" | "info" | "neutral";
} {
  switch (status) {
    case "APPROVED":
      return { label: "Verified & Approved", variant: "success" };
    case "PENDING_VERIFICATION":
    case "PENDING":
      return { label: "Pending Verification", variant: "warning" };
    case "REJECTED":
      return { label: "Rejected", variant: "danger" };
    case "DRAFT":
      return { label: "Draft", variant: "neutral" };
    case "SOLD":
      return { label: "Sold Out", variant: "info" };
    default:
      return { label: status, variant: "neutral" };
  }
}

// Extract human-friendly error message from Axios errors
export function getErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
      const details = error.response.data.errors.map((e: any) => e.message).join(", ");
      return `${error.response.data.message}: ${details}`;
    }
    return error.response.data.message;
  }
  if (error.message) return error.message;
  return "An unexpected error occurred. Please try again.";
}
