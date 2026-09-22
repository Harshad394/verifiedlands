import React from "react";

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-4 animate-pulse">
      <div className="w-full h-48 bg-slate-800 rounded-xl" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-800/60 rounded w-1/2" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-slate-800 rounded w-1/3" />
        <div className="h-8 bg-slate-800 rounded w-1/4" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-3 w-1/3">
            <div className="w-10 h-10 bg-slate-800 rounded-lg shrink-0" />
            <div className="space-y-1 w-full">
              <div className="h-3.5 bg-slate-800 rounded w-3/4" />
              <div className="h-2.5 bg-slate-800/60 rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-slate-800 rounded w-1/6" />
          <div className="h-3 bg-slate-800 rounded w-1/6" />
          <div className="h-7 bg-slate-800 rounded w-20" />
        </div>
      ))}
    </div>
  );
};
