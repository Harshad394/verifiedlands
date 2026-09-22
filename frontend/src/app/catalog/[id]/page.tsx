"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Building2,
  ShieldCheck,
  Calendar,
  MessageSquare,
  ExternalLink,
  Compass,
  CheckCircle2,
  XCircle,
  Zap,
  Droplets,
  Sprout,
  FileCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { Land } from "@/types";
import { formatINR, formatArea, formatDate, getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { MediaGallery } from "@/components/land/MediaGallery";
import { SiteVisitModal } from "@/components/land/SiteVisitModal";
import { LandChatPanel } from "@/components/land/LandChatPanel";
import { VerifiedBadge, StatusBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";

export default function LandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const landId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [land, setLand] = useState<Land | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isVisitModalOpen, setIsVisitModalOpen] = useState<boolean>(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState<boolean>(false);

  useEffect(() => {
    if (landId) {
      fetchLandDetail();
    }
  }, [landId]);

  const fetchLandDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/api/lands/${landId}`);
      if (res.data?.land) {
        setLand(res.data.land);
      }
    } catch (err: any) {
      console.error("Error fetching land detail:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: "visit" | "chat") => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/catalog/${landId}`)}`);
      return;
    }
    if (action === "visit") setIsVisitModalOpen(true);
    if (action === "chat") setIsChatPanelOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-6 bg-slate-900 rounded w-1/4 animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !land) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-4">
        <Link href="/catalog" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
        <Alert type="error" title="Unable to Load Listing" message={error || "Land listing not found or restricted."} />
      </div>
    );
  }

  const landTitle = `${formatArea(land.totalArea, land.areaUnit)} Land in ${land.village}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <Link href="/catalog" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{landTitle}</h1>
            <VerifiedBadge />
            {land.seller?.isVerified && (
              <Badge variant="info" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                Verified Owner
              </Badge>
            )}
            {land.status !== "APPROVED" && (
              <StatusBadge status={land.status} />
            )}
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <strong className="text-slate-200">{land.village}</strong>, {land.taluka}, {land.district}, {land.state} • Survey No: <strong className="text-white">{land.surveyNumber}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => handleActionClick("chat")}
            leftIcon={<MessageSquare className="w-4 h-4 text-purple-400" />}
          >
            Message Admin
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleActionClick("visit")}
            leftIcon={<Calendar className="w-4 h-4" />}
          >
            Request Site Visit
          </Button>
        </div>
      </div>

      {/* Main Grid: Media Gallery & Highlights Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Media Gallery */}
        <div className="lg:col-span-8 space-y-6">
          <MediaGallery
            images={land.images}
            videoUrl={land.videoUrl}
            droneVideoUrl={land.droneVideoUrl}
          />
        </div>

        {/* Right Column: Price & Quick Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Listed Price
              </span>
              <p className="text-3xl font-black text-emerald-400 mt-1">{formatINR(land.price)}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Area: <strong className="text-white">{formatArea(land.totalArea, land.areaUnit)}</strong>
              </p>
            </div>

            {/* Quick Actions Card */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleActionClick("visit")}
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                Schedule Site Visit
              </Button>
              <Button
                variant="dark"
                className="w-full"
                onClick={() => handleActionClick("chat")}
                leftIcon={<MessageSquare className="w-4 h-4 text-purple-400" />}
              >
                Inquire via Admin Ticket
              </Button>
            </div>

            {/* Map Coordinates Link if present */}
            {land.latitude && land.longitude && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-400" /> Exact Coordinates
                </span>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${land.latitude}&mlon=${land.longitude}#map=16/${land.latitude}/${land.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  Open Map <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Specifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Characteristics */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-emerald-400" /> Property Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 block mb-1">Ownership Type</span>
                <strong className="text-white text-sm">{land.ownershipType}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 block mb-1">Encumbrance Status</span>
                <strong className="text-white text-sm">{land.encumbranceStatus}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 block mb-1">Soil Type</span>
                <strong className="text-white text-sm">{land.soilType || "Not Specified"}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 block mb-1">Current Crops</span>
                <strong className="text-white text-sm">{land.currentCrops || "None"}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 block mb-1">Irrigation Details</span>
                <strong className="text-white text-sm">{land.irrigationDetails || "Not Specified"}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 block mb-1">Survey Number</span>
                <strong className="text-white text-sm">{land.surveyNumber}</strong>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                {land.roadTouch ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-500" />
                )}
                <span className={land.roadTouch ? "text-white font-medium" : "text-slate-500"}>
                  Road Touch Access
                </span>
              </div>

              <div className="flex items-center gap-2">
                {land.waterAvailable ? (
                  <Droplets className="w-4 h-4 text-sky-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-500" />
                )}
                <span className={land.waterAvailable ? "text-white font-medium" : "text-slate-500"}>
                  Water Available
                </span>
              </div>

              <div className="flex items-center gap-2">
                {land.electricity ? (
                  <Zap className="w-4 h-4 text-amber-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-500" />
                )}
                <span className={land.electricity ? "text-white font-medium" : "text-slate-500"}>
                  Electricity Access
                </span>
              </div>
            </div>
          </div>

          {/* Verified Property Documents */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileCheck className="w-5 h-5 text-emerald-400" /> Property Verification Documents
            </h3>

            {land.documents && land.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {land.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white">{doc.documentType} Extract</p>
                        <p className="text-[10px] text-slate-500">Verified by Admin</p>
                      </div>
                    </div>
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-800 text-emerald-400 hover:bg-slate-700 transition-colors font-medium flex items-center gap-1"
                    >
                      View Doc <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No public documents uploaded for this listing.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SiteVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        landId={land.id}
        landTitle={landTitle}
      />

      <LandChatPanel
        isOpen={isChatPanelOpen}
        onClose={() => setIsChatPanelOpen(false)}
        landId={land.id}
        landTitle={landTitle}
      />
    </div>
  );
}
