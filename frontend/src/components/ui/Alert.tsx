import React from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
  type?: "error" | "success" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = "error",
  title,
  message,
  onClose,
  className,
}) => {
  const styles = {
    error: "bg-rose-950/80 border-rose-800/80 text-rose-300",
    success: "bg-emerald-950/80 border-emerald-800/80 text-emerald-300",
    warning: "bg-amber-950/80 border-amber-800/80 text-amber-300",
    info: "bg-sky-950/80 border-sky-800/80 text-sky-300",
  };

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />,
  };

  return (
    <div className={cn("flex items-start justify-between p-4 rounded-xl border text-sm gap-3", styles[type], className)}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <div>
          {title && <h5 className="font-semibold mb-0.5 text-white">{title}</h5>}
          <p className="text-xs leading-relaxed">{message}</p>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 rounded hover:bg-black/20 text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
