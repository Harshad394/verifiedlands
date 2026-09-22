"use client";

import React from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Search, Calendar, MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function BuyerDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["BUYER", "ADMIN"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
              Buyer Portal
            </span>
            <h1 className="text-3xl font-extrabold text-white">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Browse admin-audited land listings, schedule site visits, and inquire via Admin ticket hub.
            </p>
          </div>
          <Link href="/catalog">
            <Button leftIcon={<Search className="w-4 h-4" />}>
              Explore Verified Catalog
            </Button>
          </Link>
        </div>

        {/* Dashboard Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-emerald-500/40 transition-colors">
            <div className="p-3 w-max rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Verified Land Catalog</h3>
              <p className="text-xs text-slate-400 mt-1">
                Filter lands by district, village, price, survey number, and 7/12 extract status.
              </p>
            </div>
            <Link href="/catalog" className="inline-flex items-center text-xs font-semibold text-emerald-400 gap-1 hover:underline">
              Browse Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-emerald-500/40 transition-colors">
            <div className="p-3 w-max rounded-xl bg-sky-950 text-sky-400 border border-sky-800">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Site Visit Requests</h3>
              <p className="text-xs text-slate-400 mt-1">
                View your requested site visits and check verification status from platform admins.
              </p>
            </div>
            <Link href="/buyer/site-visits" className="inline-flex items-center text-xs font-semibold text-sky-400 gap-1 hover:underline">
              My Site Visits <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-emerald-500/40 transition-colors">
            <div className="p-3 w-max rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Admin Inquiries</h3>
              <p className="text-xs text-slate-400 mt-1">
                Inquire safely regarding specific land cards via Admin direct ticket hub.
              </p>
            </div>
            <Link href="/buyer/messages" className="inline-flex items-center text-xs font-semibold text-purple-400 gap-1 hover:underline">
              My Messages <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Safety Note */}
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200 leading-relaxed">
            <strong>Platform Guarantee:</strong> VerifiedLand keeps all communications strictly between Buyer & Admin to protect you from seller impersonation, double selling, and document fraud.
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
