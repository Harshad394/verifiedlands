import React from "react";
import { Filter, RotateCcw, MapPin, DollarSign, Maximize2, Zap, Droplets, CheckCircle2 } from "lucide-react";
import { AreaUnit } from "@/types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";

export interface CatalogFilterState {
  district?: string;
  village?: string;
  taluka?: string;
  state?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  areaUnit?: AreaUnit | "";
  roadTouch?: boolean;
  waterAvailable?: boolean;
  electricity?: boolean;
}

interface CatalogFilterSidebarProps {
  filters: CatalogFilterState;
  onChange: (newFilters: CatalogFilterState) => void;
  onReset: () => void;
}

export const CatalogFilterSidebar: React.FC<CatalogFilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const handleChange = (field: keyof CatalogFilterState, value: any) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  const areaUnitOptions = [
    { value: "", label: "All Area Units" },
    { value: "ACRE", label: "Acres" },
    { value: "GUNTHA", label: "Gunthas" },
    { value: "HECTARE", label: "Hectares" },
    { value: "SQ_FT", label: "Sq. Ft." },
    { value: "SQ_MTR", label: "Sq. Mtr." },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-xl">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-emerald-400" /> Filter Listings
        </h4>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Location Filter Group */}
      <div className="space-y-3">
        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Location
        </h5>
        <Input
          placeholder="District (e.g. Pune, Satara)..."
          value={filters.district || ""}
          onChange={(e) => handleChange("district", e.target.value)}
        />
        <Input
          placeholder="Village name..."
          value={filters.village || ""}
          onChange={(e) => handleChange("village", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Taluka..."
            value={filters.taluka || ""}
            onChange={(e) => handleChange("taluka", e.target.value)}
          />
          <Input
            placeholder="State..."
            value={filters.state || ""}
            onChange={(e) => handleChange("state", e.target.value)}
          />
        </div>
      </div>

      {/* Price Range Group */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Price Range (₹)
        </h5>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice || ""}
            onChange={(e) => handleChange("minPrice", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice || ""}
            onChange={(e) => handleChange("maxPrice", e.target.value)}
          />
        </div>
      </div>

      {/* Area & Unit Group */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-emerald-400" /> Land Area
        </h5>
        <Select
          options={areaUnitOptions}
          value={filters.areaUnit || ""}
          onChange={(e) => handleChange("areaUnit", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min Area"
            value={filters.minArea || ""}
            onChange={(e) => handleChange("minArea", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max Area"
            value={filters.maxArea || ""}
            onChange={(e) => handleChange("maxArea", e.target.value)}
          />
        </div>
      </div>

      {/* Amenity Toggles */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Amenities</h5>
        <Checkbox
          label="Road Touch Access"
          checked={!!filters.roadTouch}
          onChange={(e) => handleChange("roadTouch", e.target.checked)}
        />
        <Checkbox
          label="Water Connection"
          checked={!!filters.waterAvailable}
          onChange={(e) => handleChange("waterAvailable", e.target.checked)}
        />
        <Checkbox
          label="Electricity Access"
          checked={!!filters.electricity}
          onChange={(e) => handleChange("electricity", e.target.checked)}
        />
      </div>

      <Button variant="outline" className="w-full" size="sm" onClick={onReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
        Clear Filters
      </Button>
    </div>
  );
};
