"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect user to their own role dashboard if unauthorized for this route
        if (user.role === "ADMIN") {
          router.push("/admin");
        } else if (user.role === "SELLER") {
          router.push("/seller");
        } else {
          router.push("/buyer");
        }
      }
    }
  }, [user, isLoading, allowedRoles, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-4">
        <div className="text-center space-y-2 mb-8">
          <h3 className="text-base font-semibold text-white">Verifying Authorization...</h3>
          <p className="text-xs text-slate-400">Checking account permissions and active session</p>
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
