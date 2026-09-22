import React from "react";
import Link from "next/link";
import { MapPin, Building2, ShieldCheck, CheckCircle2, Zap, Droplets, Compass } from "lucide-react";
import { Land } from "@/types";
import { formatINR, formatArea } from "@/lib/utils";
import { VerifiedBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface LandCardProps {
  land: Land;
}

export const LandCard: React.FC<LandCardProps> = ({ land }) => {
  return (
    <div className="group bg-slate-900 border border-slate-800/90 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col shadow-xl">
      {/* Media Preview Header */}
      <div className="relative h-52 bg-slate-950 overflow-hidden">
        {land.images && land.images.length > 0 ? (
          <img
            src={land.images[0]}
            alt={`${land.village} Land`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
            <Building2 className="w-10 h-10 mb-1" />
            <span className="text-xs font-medium">No Image Uploaded</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <VerifiedBadge />
          {land.seller?.isVerified && (
            <Badge variant="info" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
              Verified Owner
            </Badge>
          )}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md text-emerald-400 text-base font-extrabold border border-slate-800 shadow-md">
          {formatINR(land.price)}
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Location Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-bold text-slate-200">{land.village}</span>, {land.taluka},{" "}
            {land.district}, {land.state}
          </div>

          {/* Title / Area */}
          <h3 className="text-lg font-extrabold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {formatArea(land.totalArea, land.areaUnit)} Land
          </h3>
        </div>

        {/* Property Characteristics Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">Survey: <strong className="text-white">{land.surveyNumber}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate"><strong className="text-white">{land.ownershipType}</strong></span>
          </div>
        </div>

        {/* Amenity Badges */}
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {land.roadTouch && (
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-900 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Road Touch
            </span>
          )}
          {land.waterAvailable && (
            <span className="px-2 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-900 flex items-center gap-1">
              <Droplets className="w-3 h-3" /> Water
            </span>
          )}
          {land.electricity && (
            <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-900 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Electricity
            </span>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Docs: <strong className="text-emerald-400 font-semibold">{land.documents?.length || 0} Verified</strong>
          </span>

          <Link href={`/catalog/${land.id}`}>
            <Button size="sm" variant="dark">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
