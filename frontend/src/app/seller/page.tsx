"use client";

import React from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { PlusCircle, FileText, UserCheck, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SellerDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["SELLER", "ADMIN"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-teal-400">
              Seller Portal
            </span>
            <h1 className="text-3xl font-extrabold text-white">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              List land listings, upload property verification documents (7/12, 8A, Sale Deed), and track KYC verification.
            </p>
          </div>
          <Link href="/seller/upload">
            <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
              List New Land Listing
            </Button>
          </Link>
        </div>

        {/* Seller Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-teal-500/40 transition-colors">
            <div className="p-3 w-max rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">List New Property</h3>
              <p className="text-xs text-slate-400 mt-1">
                Upload survey numbers, total area, price, photos, videos, and legal documents for admin review.
              </p>
            </div>
            <Link href="/seller/upload" className="inline-flex items-center text-xs font-semibold text-teal-400 gap-1 hover:underline">
              Create Listing <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-teal-500/40 transition-colors">
            <div className="p-3 w-max rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">My Uploaded Listings</h3>
              <p className="text-xs text-slate-400 mt-1">
                Track verification status (`PENDING_VERIFICATION`, `APPROVED`, `REJECTED`) and document failure notes.
              </p>
            </div>
            <Link href="/seller/dashboard" className="inline-flex items-center text-xs font-semibold text-emerald-400 gap-1 hover:underline">
              View My Listings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-teal-500/40 transition-colors">
            <div className="p-3 w-max rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Seller Identity KYC</h3>
              <p className="text-xs text-slate-400 mt-1">
                Upload Aadhaar and PAN cards to receive Verified Owner status across your listings.
              </p>
            </div>
            <Link href="/profile" className="inline-flex items-center text-xs font-semibold text-amber-400 gap-1 hover:underline">
              Check KYC Status <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* KYC Alert */}
        {!user?.isVerified && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200">
                <strong>KYC Verification Recommended:</strong> Submit your Aadhaar or PAN verification documents to speed up land audit approvals.
              </div>
            </div>
            <Link href="/profile">
              <Button size="sm" variant="outline">
                Upload KYC
              </Button>
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
