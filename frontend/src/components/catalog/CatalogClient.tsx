"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BadgeIndianRupee,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Filter,
  Gauge,
  ImageIcon,
  LandPlot,
  MapPin,
  PlugZap,
  Road,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatArea, formatINR, getErrorMessage } from "@/lib/utils";
import { AreaUnit, Land, LandCatalogQuery, LandCatalogResponse } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { Badge, VerifiedBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Select } from "@/components/ui/Select";

type FilterState = {
  state: string;
  district: string;
  taluka: string;
  village: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  areaUnit: AreaUnit | "";
  roadTouch: boolean;
  waterAvailable: boolean;
  electricity: boolean;
  limit: string;
};

const areaUnitOptions = [
  { value: "", label: "Any unit" },
  { value: "ACRE", label: "Acre" },
  { value: "GUNTHA", label: "Guntha" },
  { value: "HECTARE", label: "Hectare" },
  { value: "SQ_FT", label: "Sq. ft." },
  { value: "SQ_MTR", label: "Sq. mtr." },
];

const limitOptions = [
  { value: "9", label: "9 per page" },
  { value: "12", label: "12 per page" },
  { value: "24", label: "24 per page" },
];

const defaultFilters: FilterState = {
  state: "",
  district: "",
  taluka: "",
  village: "",
  minPrice: "",
  maxPrice: "",
  minArea: "",
  maxArea: "",
  areaUnit: "",
  roadTouch: false,
  waterAvailable: false,
  electricity: false,
  limit: "9",
};

function searchParamsToFilters(searchParams: URLSearchParams): FilterState {
  return {
    state: searchParams.get("state") || "",
    district: searchParams.get("district") || "",
    taluka: searchParams.get("taluka") || "",
    village: searchParams.get("village") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    areaUnit: (searchParams.get("areaUnit") as AreaUnit | null) || "",
    roadTouch: searchParams.get("roadTouch") === "true",
    waterAvailable: searchParams.get("waterAvailable") === "true",
    electricity: searchParams.get("electricity") === "true",
    limit: searchParams.get("limit") || "9",
  };
}

function toCatalogParams(filters: FilterState, page: number): LandCatalogQuery {
  return {
    state: filters.state.trim() || undefined,
    district: filters.district.trim() || undefined,
    taluka: filters.taluka.trim() || undefined,
    village: filters.village.trim() || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    minArea: filters.minArea || undefined,
    maxArea: filters.maxArea || undefined,
    areaUnit: filters.areaUnit || undefined,
    roadTouch: filters.roadTouch || undefined,
    waterAvailable: filters.waterAvailable || undefined,
    electricity: filters.electricity || undefined,
    page,
    limit: Number(filters.limit) || 9,
  };
}

function buildQueryString(filters: FilterState, page: number) {
  const params = new URLSearchParams();
  const catalogParams = toCatalogParams(filters, page);

  Object.entries(catalogParams).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

function FilterPanel({
  filters,
  onChange,
  onSubmit,
  onReset,
  className,
}: {
  filters: FilterState;
  onChange: (next: Partial<FilterState>) => void;
  onSubmit: () => void;
  onReset: () => void;
  className?: string;
}) {
  return (
    <form
      className={cn("space-y-5", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <MapPin className="h-4 w-4 text-emerald-400" />
          Location
        </div>
        <div className="grid gap-3">
          <Input
            label="State"
            value={filters.state}
            onChange={(event) => onChange({ state: event.target.value })}
            placeholder="Maharashtra"
          />
          <Input
            label="District"
            value={filters.district}
            onChange={(event) => onChange({ district: event.target.value })}
            placeholder="Pune"
          />
          <Input
            label="Taluka"
            value={filters.taluka}
            onChange={(event) => onChange({ taluka: event.target.value })}
            placeholder="Haveli"
          />
          <Input
            label="Village"
            value={filters.village}
            onChange={(event) => onChange({ village: event.target.value })}
            placeholder="Wagholi"
          />
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <BadgeIndianRupee className="h-4 w-4 text-emerald-400" />
          Price Range
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Min"
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(event) => onChange({ minPrice: event.target.value })}
            placeholder="1000000"
          />
          <Input
            label="Max"
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(event) => onChange({ maxPrice: event.target.value })}
            placeholder="5000000"
          />
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <LandPlot className="h-4 w-4 text-emerald-400" />
          Area
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Min"
            type="number"
            min="0"
            step="0.01"
            value={filters.minArea}
            onChange={(event) => onChange({ minArea: event.target.value })}
            placeholder="1"
          />
          <Input
            label="Max"
            type="number"
            min="0"
            step="0.01"
            value={filters.maxArea}
            onChange={(event) => onChange({ maxArea: event.target.value })}
            placeholder="10"
          />
        </div>
        <Select
          label="Area Unit"
          value={filters.areaUnit}
          onChange={(event) => onChange({ areaUnit: event.target.value as AreaUnit | "" })}
          options={areaUnitOptions}
        />
      </div>

      <div className="h-px bg-slate-800" />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
          Amenities
        </div>
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <Checkbox
            label="Road touch"
            checked={filters.roadTouch}
            onChange={(event) => onChange({ roadTouch: event.target.checked })}
          />
          <Checkbox
            label="Water available"
            checked={filters.waterAvailable}
            onChange={(event) => onChange({ waterAvailable: event.target.checked })}
          />
          <Checkbox
            label="Electricity"
            checked={filters.electricity}
            onChange={(event) => onChange({ electricity: event.target.checked })}
          />
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      <Select
        label="Page Size"
        value={filters.limit}
        onChange={(event) => onChange({ limit: event.target.value })}
        options={limitOptions}
      />

      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onReset} leftIcon={<RotateCcw className="h-4 w-4" />}>
          Reset
        </Button>
        <Button type="submit" leftIcon={<Search className="h-4 w-4" />}>
          Apply
        </Button>
      </div>
    </form>
  );
}

function AmenityBadge({
  active,
  icon,
  children,
}: {
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold",
        active
          ? "border-emerald-800 bg-emerald-950/70 text-emerald-300"
          : "border-slate-800 bg-slate-900/80 text-slate-500"
      )}
    >
      {icon}
      {children}
    </span>
  );
}

function LandCard({ land }: { land: Land }) {
  const imageUrl = land.images?.[0];
  const approvedDocCount = land.documents?.filter((document) => document.status === "APPROVED").length || 0;

  return (
    <article className="group flex min-h-[470px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg transition-colors hover:border-emerald-700/70">
      <div className="relative h-48 overflow-hidden bg-slate-950">
        {imageUrl ? (
          <div
            aria-label={`${land.totalArea} ${land.areaUnit} land in ${land.village}`}
            className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            role="img"
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-600">
            <ImageIcon className="h-10 w-10" />
            <span className="text-xs font-medium">No image uploaded</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {land.verifiedBadge ? <VerifiedBadge /> : <Badge variant="neutral">Admin Listed</Badge>}
          {land.seller?.isVerified && (
            <Badge variant="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
              Seller KYC
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 right-3 rounded-lg border border-slate-800 bg-slate-950/85 px-3 py-1 text-sm font-black text-emerald-300 backdrop-blur">
          {formatINR(land.price)}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs font-medium leading-relaxed text-slate-400">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                <strong className="font-bold text-slate-200">{land.village}</strong>, {land.taluka}, {land.district},{" "}
                {land.state}
              </span>
            </div>
            <h2 className="text-base font-black leading-snug text-white">
              {formatArea(land.totalArea, land.areaUnit)} verified land
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs">
            <div>
              <p className="text-slate-500">Survey No.</p>
              <p className="truncate font-bold text-slate-200">{land.surveyNumber}</p>
            </div>
            <div>
              <p className="text-slate-500">Documents</p>
              <p className="font-bold text-emerald-300">{approvedDocCount} approved</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <AmenityBadge active={land.roadTouch} icon={<Road className="h-3.5 w-3.5" />}>
              Road
            </AmenityBadge>
            <AmenityBadge active={land.waterAvailable} icon={<Droplets className="h-3.5 w-3.5" />}>
              Water
            </AmenityBadge>
            <AmenityBadge active={land.electricity} icon={<PlugZap className="h-3.5 w-3.5" />}>
              Electricity
            </AmenityBadge>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Seller contact is protected through VerifiedLand admin.</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase text-slate-500">Ownership</p>
            <p className="truncate text-xs font-bold text-slate-300">{land.ownershipType}</p>
          </div>
          <Link href={`/lands/${land.id}`}>
            <Button size="sm" variant="dark" rightIcon={<ChevronRight className="h-4 w-4" />}>
              View
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function CatalogClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  const [filters, setFilters] = useState<FilterState>(() => searchParamsToFilters(searchParams));
  const [lands, setLands] = useState<Land[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    const current = searchParamsToFilters(searchParams);
    return [
      current.state,
      current.district,
      current.taluka,
      current.village,
      current.minPrice,
      current.maxPrice,
      current.minArea,
      current.maxArea,
      current.areaUnit,
      current.roadTouch,
      current.waterAvailable,
      current.electricity,
    ].filter(Boolean).length;
  }, [searchParams]);

  useEffect(() => {
    const nextFilters = searchParamsToFilters(searchParams);
    const nextPage = Number(searchParams.get("page") || "1") || 1;
    setFilters(nextFilters);
    setPage(nextPage);

    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = toCatalogParams(nextFilters, nextPage);
        const response = await api.get<LandCatalogResponse>("/api/lands/catalog", { params });
        setLands(response.data.lands || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        setError(getErrorMessage(err));
        setLands([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [searchKey, searchParams]);

  const updateFilters = (next: Partial<FilterState>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  const pushFilters = (nextFilters: FilterState, nextPage = 1) => {
    const query = buildQueryString(nextFilters, nextPage);
    router.push(query ? `${pathname}?${query}` : pathname);
    setIsMobileFiltersOpen(false);
  };

  const goToPage = (nextPage: number) => {
    const boundedPage = Math.max(1, Math.min(totalPages, nextPage));
    pushFilters(filters, boundedPage);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    router.push(pathname);
    setIsMobileFiltersOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge variant="success" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                Approved buyer catalog
              </Badge>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Browse Verified Lands</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                  Search admin-approved land listings by location, price, area, and site amenities. Seller contact
                  details stay private for buyer safety.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                <p className="text-[11px] uppercase text-slate-500">Matched lands</p>
                <p className="text-xl font-black text-white">{total}</p>
              </div>
              <Button
                className="lg:hidden"
                variant="outline"
                onClick={() => setIsMobileFiltersOpen(true)}
                leftIcon={<Filter className="h-4 w-4" />}
              >
                Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
              </Button>
            </div>
          </div>
        </section>

        {error && <Alert type="error" title="Catalog unavailable" message={error} />}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-white">Filters</h2>
                  <p className="text-xs text-slate-500">Synced with URL search params.</p>
                </div>
                {activeFilterCount > 0 && <Badge variant="info">{activeFilterCount} active</Badge>}
              </div>
              <FilterPanel
                filters={filters}
                onChange={updateFilters}
                onSubmit={() => pushFilters(filters, 1)}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <section className="space-y-5">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Gauge className="h-4 w-4 text-emerald-400" />
                <span>
                  Showing page <strong className="text-white">{page}</strong> of{" "}
                  <strong className="text-white">{totalPages}</strong>
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Only listings with backend status <strong className="text-slate-300">APPROVED</strong> are returned.
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: Number(filters.limit) || 9 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              </div>
            ) : lands.length === 0 ? (
              <EmptyState
                icon={<Building2 className="h-10 w-10 text-slate-500" />}
                title="No verified lands match these filters"
                description="Try widening the location, price, or amenity filters. New admin-approved listings will appear here automatically."
                actionLabel="Reset Filters"
                onAction={resetFilters}
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {lands.map((land) => (
                  <LandCard key={land.id} land={land} />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                {total > 0 ? (
                  <>
                    Page <strong className="text-slate-200">{page}</strong> of{" "}
                    <strong className="text-slate-200">{totalPages}</strong> for{" "}
                    <strong className="text-slate-200">{total}</strong> approved listings
                  </>
                ) : (
                  "No approved listings found"
                )}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => goToPage(page - 1)}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => goToPage(page + 1)}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close filters"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <div>
                <h2 className="text-sm font-black text-white">Catalog Filters</h2>
                <p className="text-xs text-slate-500">Location, price, area, amenities.</p>
              </div>
              <button
                className="rounded-lg border border-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel
                filters={filters}
                onChange={updateFilters}
                onSubmit={() => pushFilters(filters, 1)}
                onReset={resetFilters}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
