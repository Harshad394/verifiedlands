"use client";

import React from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, FileCheck, UserCheck, CalendarCheck, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-rose-400 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Platform Admin Portal
            </span>
            <h1 className="text-3xl font-extrabold text-white">
              VerifiedLand Audit Control Panel
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Audit pending land listings, verify property documents, process seller KYC, and manage site visit scheduling.
            </p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="primary">
              Open Full Audit Suite
            </Button>
          </Link>
        </div>

        {/* Admin Navigation Queues */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-emerald-500/40 transition-colors">
            <div className="p-3 w-max rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Land Verification Queue</h3>
              <p className="text-xs text-slate-400 mt-1">
                Audit 7/12, 8A, Sale Deed, Mutation documents and approve/reject land listings.
              </p>
            </div>
            <Link href="/admin/dashboard" className="inline-flex items-center text-xs font-semibold text-emerald-400 gap-1 hover:underline">
              Audit Lands <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-amber-500/40 transition-colors">
            <div className="p-3 w-max rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Seller KYC Approvals</h3>
              <p className="text-xs text-slate-400 mt-1">
                Review uploaded seller Aadhaar and PAN documents for verified owner badges.
              </p>
            </div>
            <Link href="/admin/dashboard?tab=kyc" className="inline-flex items-center text-xs font-semibold text-amber-400 gap-1 hover:underline">
              Review KYC <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-sky-500/40 transition-colors">
            <div className="p-3 w-max rounded-xl bg-sky-950 text-sky-400 border border-sky-800">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Site Visit Queue</h3>
              <p className="text-xs text-slate-400 mt-1">
                Approve buyer site visit date requests and manage buyer-seller inspection logistics.
              </p>
            </div>
            <Link href="/admin/dashboard?tab=site-visits" className="inline-flex items-center text-xs font-semibold text-sky-400 gap-1 hover:underline">
              Manage Visits <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-purple-500/40 transition-colors">
            <div className="p-3 w-max rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Admin Inbox</h3>
              <p className="text-xs text-slate-400 mt-1">
                Respond to incoming buyer inquiries and land ticket queries directly.
              </p>
            </div>
            <Link href="/admin/dashboard?tab=messages" className="inline-flex items-center text-xs font-semibold text-purple-400 gap-1 hover:underline">
              Open Inbox <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
