import React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const checkboxId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex items-start gap-3">
        <input
          id={checkboxId}
          ref={ref}
          type="checkbox"
          className={cn(
            "w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-950 mt-0.5 transition-colors cursor-pointer",
            className
          )}
          {...props}
        />
        <div className="text-sm">
          <label htmlFor={checkboxId} className="font-medium text-slate-200 cursor-pointer select-none">
            {label}
          </label>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
