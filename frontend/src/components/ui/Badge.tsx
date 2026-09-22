import React from "react";
import { ShieldCheck, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { cn, getStatusBadgeProps } from "@/lib/utils";
import { LandStatus, VerificationStatus } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  className,
  icon,
}) => {
  const variantStyles = {
    success: "bg-emerald-950/80 text-emerald-400 border-emerald-800/60",
    warning: "bg-amber-950/80 text-amber-400 border-amber-800/60",
    danger: "bg-rose-950/80 text-rose-400 border-rose-800/60",
    info: "bg-sky-950/80 text-sky-400 border-sky-800/60",
    neutral: "bg-slate-800/80 text-slate-300 border-slate-700",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5 font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{
  status: LandStatus | VerificationStatus;
  className?: string;
}> = ({ status, className }) => {
  const { label, variant } = getStatusBadgeProps(status);

  const getIcon = () => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "PENDING":
      case "PENDING_VERIFICATION":
        return <Clock className="w-3.5 h-3.5" />;
      case "REJECTED":
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <Badge variant={variant} icon={getIcon()} className={className}>
      {label}
    </Badge>
  );
};

export const VerifiedBadge: React.FC<{ className?: string }> = ({ className }) => (
  <Badge variant="success" icon={<ShieldCheck className="w-3.5 h-3.5" />} className={className}>
    Verified Land
  </Badge>
);
