"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Search, PlusCircle, LayoutDashboard, User, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800/80 text-emerald-400 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1">
              Verified<span className="text-emerald-400">Land</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
              Admin-Verified Marketplace
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/catalog"
            className={cn(
              "px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
              isActive("/catalog")
                ? "bg-slate-800 text-emerald-400"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            )}
          >
            <Search className="w-4 h-4" />
            <span>Browse Lands</span>
          </Link>

          {user && (user.role === "SELLER" || user.role === "ADMIN") && (
            <Link
              href="/seller/upload"
              className={cn(
                "px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                isActive("/seller/upload")
                  ? "bg-slate-800 text-emerald-400"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              )}
            >
              <PlusCircle className="w-4 h-4" />
              <span>List New Land</span>
            </Link>
          )}

          {user && (user.role === "SELLER" || user.role === "ADMIN") && (
            <Link
              href="/seller/dashboard"
              className={cn(
                "px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                isActive("/seller/dashboard")
                  ? "bg-slate-800 text-emerald-400"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Seller Dashboard</span>
            </Link>
          )}

          {user && user.role === "ADMIN" && (
            <Link
              href="/admin/dashboard"
              className={cn(
                "px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border border-emerald-800/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/50"
              )}
            >
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Admin Verification Panel</span>
            </Link>
          )}
        </nav>

        {/* User Profile / Auth Action */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center font-bold text-xs">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold max-w-[120px] truncate hidden sm:inline">
                  {user.fullName}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile & KYC</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
