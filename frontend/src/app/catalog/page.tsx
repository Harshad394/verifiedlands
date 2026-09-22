"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Filter, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { Land, AreaUnit } from "@/types";
import { getErrorMessage } from "@/lib/utils";
import { LandCard } from "@/components/catalog/LandCard";
import { CatalogFilterSidebar, CatalogFilterState } from "@/components/catalog/CatalogFilterSidebar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial filters from URL params
  const initialFilters: CatalogFilterState = {
    district: searchParams.get("district") || "",
    village: searchParams.get("village") || "",
    taluka: searchParams.get("taluka") || "",
    state: searchParams.get("state") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    areaUnit: (searchParams.get("areaUnit") as AreaUnit) || "",
    roadTouch: searchParams.get("roadTouch") === "true",
    waterAvailable: searchParams.get("waterAvailable") === "true",
    electricity: searchParams.get("electricity") === "true",
  };

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [filters, setFilters] = useState<CatalogFilterState>(initialFilters);
  const [page, setPage] = useState<number>(currentPage);

  const [lands, setLands] = useState<Land[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Sync state to URL and fetch catalog lands
  useEffect(() => {
    fetchCatalogLands();
  }, [filters, page]);

  const fetchCatalogLands = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      if (filters.district) params.set("district", filters.district);
      if (filters.village) params.set("village", filters.village);
      if (filters.taluka) params.set("taluka", filters.taluka);
      if (filters.state) params.set("state", filters.state);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.minArea) params.set("minArea", filters.minArea);
      if (filters.maxArea) params.set("maxArea", filters.maxArea);
      if (filters.areaUnit) params.set("areaUnit", filters.areaUnit);
      if (filters.roadTouch) params.set("roadTouch", "true");
      if (filters.waterAvailable) params.set("waterAvailable", "true");
      if (filters.electricity) params.set("electricity", "true");
      params.set("page", page.toString());
      params.set("limit", "9");

      // Update URL without full page reload
      const newUrl = `/catalog?${params.toString()}`;
      router.push(newUrl, { scroll: false });

      const res = await api.get(`/api/lands/catalog?${params.toString()}`);
      if (res.data) {
        setLands(res.data.lands || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Error fetching catalog:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: CatalogFilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 on filter change
  };

  const handleResetFilters = () => {
    const empty: CatalogFilterState = {
      district: "",
      village: "",
      taluka: "",
      state: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      areaUnit: "",
      roadTouch: false,
      waterAvailable: false,
      electricity: false,
    };
    setFilters(empty);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
              Verified Marketplace
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Public Land Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse {total} verified lands audited for 7/12, 8A, Sale Deed, and encumbrance safety.
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center gap-3 sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(true)}
            leftIcon={<Filter className="w-4 h-4 text-emerald-400" />}
          >
            Filters ({Object.values(filters).filter(Boolean).length})
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20">
          <CatalogFilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Mobile Filter Modal */}
        <Modal
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          title="Filter Land Listings"
        >
          <CatalogFilterSidebar
            filters={filters}
            onChange={(f) => {
              handleFilterChange(f);
              setIsMobileFilterOpen(false);
            }}
            onReset={() => {
              handleResetFilters();
              setIsMobileFilterOpen(false);
            }}
          />
        </Modal>

        {/* Main Grid */}
        <main className="lg:col-span-9 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : lands.length === 0 ? (
            <EmptyState
              icon={<Search className="w-10 h-10 text-slate-500" />}
              title="No Lands Match Your Filters"
              description="Try adjusting your district, village, price range, or amenity toggles to discover available verified lands."
              actionLabel="Clear All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lands.map((land) => (
                  <LandCard key={land.id} land={land} />
                ))}
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-8 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    Showing Page <strong className="text-white">{page}</strong> of{" "}
                    <strong className="text-white">{totalPages}</strong> ({total} total lands)
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      leftIcon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
          <div className="h-8 bg-slate-900 rounded w-1/4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
