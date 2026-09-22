"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  FileText,
  MapPin,
  Lock,
  ArrowRight,
  TrendingUp,
  Building2,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";
import { Land } from "@/types";
import { formatINR, formatArea, getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge, VerifiedBadge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Alert } from "@/components/ui/Alert";

export default function HomePage() {
  const [featuredLands, setFeaturedLands] = useState<Land[]>([]);
  const [totalLands, setTotalLands] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search form quick filters
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");

  useEffect(() => {
    fetchFeaturedLands();
  }, []);

  const fetchFeaturedLands = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get("/api/lands/catalog?limit=6");
      if (res.data?.lands) {
        setFeaturedLands(res.data.lands);
        setTotalLands(res.data.total || res.data.lands.length);
      }
    } catch (err: any) {
      console.error("Error loading catalog lands:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Official 7/12 & 8A Document Verification</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Buy & Sell Land With <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                100% Admin-Verified Trust
              </span>
            </h1>

            <p className="text-base text-slate-300 max-w-xl leading-relaxed">
              Every land listing is audited by experts. Property documents (7/12, 8A, Sale Deed, Mutation) and owner KYC are verified before publication.
            </p>

            {/* Quick Search Box */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Enter District (e.g. Pune, Satara)..."
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
                <Input
                  placeholder="Enter Village / Taluka..."
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="flex justify-end">
                <Link
                  href={`/catalog?${new URLSearchParams({
                    ...(district && { district }),
                    ...(village && { village }),
                  }).toString()}`}
                >
                  <Button variant="primary" leftIcon={<Search className="w-4 h-4" />}>
                    Search Verified Catalog
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Platform Safety Metric Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="p-2.5 w-max rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Verified Documents</h4>
              <p className="text-xs text-slate-400">
                7/12 Extracts, 8A, Sale Deeds, and Mutation records verified for encumbrance safety.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="p-2.5 w-max rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">No Direct Contact</h4>
              <p className="text-xs text-slate-400">
                Buyers communicate through Admin ticket hubs, eliminating spam and fraudulent sellers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Platform Verification Status
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-xs font-semibold">
                  Active Audit
                </span>
              </div>
              <p className="text-2xl font-black text-white">{totalLands} Lands Verified</p>
              <p className="text-xs text-slate-400">Available in public catalog following strict verification checks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Lands Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              Featured Verified Lands
            </h2>
            <p className="text-xs text-slate-400">
              Explore admin-audited land listings with clear legal documentation.
            </p>
          </div>
          <Link href="/catalog">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View Full Catalog ({totalLands})
            </Button>
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        {/* Catalog Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : featuredLands.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <p className="text-slate-400 text-sm">No verified lands published in the catalog yet.</p>
            <Link href="/seller/upload" className="mt-4 inline-block">
              <Button size="sm">List a Land for Verification</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredLands.map((land) => (
              <div
                key={land.id}
                className="group bg-slate-900 border border-slate-800/90 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col shadow-lg"
              >
                {/* Land Image Preview */}
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  {land.images && land.images.length > 0 ? (
                    <img
                      src={land.images[0]}
                      alt={`${land.village} Land`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
                      <Building2 className="w-10 h-10 mb-1" />
                      <span className="text-xs">No Image Available</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <VerifiedBadge />
                  </div>

                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-emerald-400 text-sm font-bold border border-slate-800">
                    {formatINR(land.price)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-slate-200">{land.village}</span>, {land.taluka},{" "}
                      {land.district}
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {formatArea(land.totalArea, land.areaUnit)} Land in {land.village}
                    </h3>
                  </div>

                  {/* Attributes Badges */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Survey: {land.surveyNumber}
                    </span>
                    {land.roadTouch && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900">
                        Road Touch
                      </span>
                    )}
                    {land.waterAvailable && (
                      <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-900">
                        Water Available
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Doc Status: <strong className="text-emerald-400">{land.documents?.length || 0} Docs Verified</strong>
                    </span>

                    <Link href={`/catalog/${land.id}`}>
                      <Button size="sm" variant="dark">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
