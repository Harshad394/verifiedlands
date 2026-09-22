import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, FileCheck, CheckCircle2 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white">VerifiedLand</span>
          </div>
          <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
            The trusted land marketplace. All listings, 7/12 extracts, 8A documents, survey numbers, and seller identity are audited and verified by platform admins prior to catalog publication.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-emerald-400 pt-1">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> No Direct Seller Contact
            </span>
            <span className="flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" /> Document Verification
            </span>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-2">
          <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">Platform</h5>
          <ul className="space-y-1.5 text-slate-400">
            <li>
              <Link href="/catalog" className="hover:text-emerald-400 transition-colors">
                Browse Verified Catalog
              </Link>
            </li>
            <li>
              <Link href="/seller/upload" className="hover:text-emerald-400 transition-colors">
                List Land for Verification
              </Link>
            </li>
            <li>
              <Link href="/admin/dashboard" className="hover:text-emerald-400 transition-colors">
                Admin Audit Panel
              </Link>
            </li>
          </ul>
        </div>

        {/* Verification guarantee */}
        <div className="space-y-2">
          <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">Document Audit</h5>
          <ul className="space-y-1.5 text-slate-400">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 7/12 & 8A Extract Verification
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sale Deed & Mutation Audit
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Aadhaar & PAN KYC Checks
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <p>© {new Date().getFullYear()} VerifiedLand Marketplace. All rights reserved.</p>
        <p>Built with Next.js 16, TypeScript & Prisma API</p>
      </div>
    </footer>
  );
};
