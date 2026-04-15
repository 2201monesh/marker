import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { View, Fabric, Mill } from "./types";

interface AdvancedFilters {
  millId: string;
  composition: string;
  weightMin: string;
  weightMax: string;
  priceMin: string;
  priceMax: string;
  moqMin: string;
  moqMax: string;
  paymentTerms: string;
}

const EMPTY_FILTERS: AdvancedFilters = {
  millId: "",
  composition: "",
  weightMin: "",
  weightMax: "",
  priceMin: "",
  priceMax: "",
  moqMin: "",
  moqMax: "",
  paymentTerms: "",
};

const PAYMENT_TERMS_OPTIONS = [
  "T/T advance",
  "T/T 30d",
  "T/T 50/50",
  "T/T 20/80",
  "L/C at sight",
  "L/C 30d",
  "L/C 60d",
  "Net 30",
  "Net 45",
  "Net 60",
];

/** Extract a number from strings like "180g", "$5.95/yd", "3,000 yds" */
function parseNum(s: string): number | null {
  const cleaned = s.replace(/[,$]/g, "").match(/[\d.]+/);
  return cleaned ? parseFloat(cleaned[0]) : null;
}

/** Try to auto-populate advanced filters from a free-text query */
function autoPopulate(query: string, mills: Mill[]): AdvancedFilters {
  const filters = { ...EMPTY_FILTERS };
  const q = query.trim().toLowerCase();
  if (!q) return filters;

  // Check if query matches a mill name
  const matchedMill = mills.find((m) => m.name.toLowerCase().includes(q));
  if (matchedMill) {
    filters.millId = matchedMill.id;
    return filters;
  }

  // Check for composition keywords
  const compositionKeywords = [
    "cotton", "polyester", "poly", "wool", "linen", "silk",
    "nylon", "viscose", "spandex", "elastane", "tencel",
    "lyocell", "cashmere", "modal",
  ];
  if (compositionKeywords.some((kw) => q.includes(kw))) {
    filters.composition = query.trim();
    return filters;
  }

  // Check for weight pattern (number + "g")
  const weightMatch = q.match(/^(\d+)\s*g$/);
  if (weightMatch) {
    const w = parseInt(weightMatch[1]);
    filters.weightMin = String(Math.max(0, w - 30));
    filters.weightMax = String(w + 30);
    return filters;
  }

  // Check for price pattern ($number)
  const priceMatch = q.match(/^\$?(\d+(?:\.\d+)?)/);
  if (priceMatch && q.includes("$")) {
    const p = parseFloat(priceMatch[1]);
    filters.priceMin = String(Math.max(0, p - 2));
    filters.priceMax = String(p + 2);
    return filters;
  }

  return filters;
}

interface FabricSearchProps {
  mills: Mill[];
  fabrics: Fabric[];
  onNavigate: (view: View) => void;
}

export function FabricSearch({ mills, fabrics, onNavigate }: FabricSearchProps) {
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>(EMPTY_FILTERS);

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const sortedMills = useMemo(
    () => [...mills].sort((a, b) => a.name.localeCompare(b.name)),
    [mills]
  );

  const updateFilter = (key: keyof AdvancedFilters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const handleToggleAdvanced = () => {
    if (!showAdvanced && query.trim()) {
      // Auto-populate filters from the current query
      setFilters(autoPopulate(query, mills));
    }
    setShowAdvanced((prev) => !prev);
  };

  const filtered = useMemo(() => {
    return fabrics.filter((f) => {
      const mill = mills.find((m) => m.id === f.millId);

      // Basic text search (only when advanced is closed or no advanced filters active)
      if (query.trim() && !showAdvanced) {
        const q = query.toLowerCase();
        const textMatch =
          f.artNumber.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q) ||
          f.composition.toLowerCase().includes(q) ||
          (mill?.name.toLowerCase().includes(q) ?? false);
        if (!textMatch) return false;
      }

      // Advanced filters (when panel is open)
      if (showAdvanced) {
        if (filters.millId && f.millId !== filters.millId) return false;

        if (filters.composition) {
          const comp = filters.composition.toLowerCase();
          if (!f.composition.toLowerCase().includes(comp)) return false;
        }

        if (filters.weightMin || filters.weightMax) {
          const w = parseNum(f.weight);
          if (w === null) return false;
          if (filters.weightMin && w < parseFloat(filters.weightMin)) return false;
          if (filters.weightMax && w > parseFloat(filters.weightMax)) return false;
        }

        if (filters.priceMin || filters.priceMax) {
          const p = parseNum(f.price);
          if (p === null) return false;
          if (filters.priceMin && p < parseFloat(filters.priceMin)) return false;
          if (filters.priceMax && p > parseFloat(filters.priceMax)) return false;
        }

        if (filters.moqMin || filters.moqMax) {
          const m = parseNum(f.moq);
          if (m === null) return false;
          if (filters.moqMin && m < parseFloat(filters.moqMin)) return false;
          if (filters.moqMax && m > parseFloat(filters.moqMax)) return false;
        }

        if (filters.paymentTerms) {
          if (!f.paymentTerms.includes(filters.paymentTerms)) return false;
        }
      }

      return true;
    });
  }, [fabrics, mills, query, showAdvanced, filters]);

  const millCount = new Set(filtered.map((f) => f.millId)).size;

  const copyEmail = useCallback(
    (e: React.MouseEvent, fabric: Fabric) => {
      e.stopPropagation();
      navigator.clipboard.writeText(fabric.contactEmail);
      setCopiedId(fabric.id);
      setTimeout(() => setCopiedId(null), 1500);
    },
    []
  );

  const getMillName = (millId: string) =>
    mills.find((m) => m.id === millId)?.name ?? "";

  const columns = [
    "Mill",
    "Art #",
    "Composition",
    "Weight",
    "Price",
    "MOQ",
    "MOC",
    "Payment Terms",
    "Contact",
  ] as const;

  return (
    <div className="flex-1 overflow-x-auto p-6 md:p-7">
      {/* Search Bar */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fabrics, mills, compositions, art #s..."
            className="w-full max-w-[500px] rounded-lg border border-border bg-white px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleToggleAdvanced}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-3 text-[12px] font-medium transition-colors",
              showAdvanced
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"
            )}
            title="Advanced search"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="4" x2="14" y2="4" />
              <line x1="4" y1="8" x2="12" y2="8" />
              <line x1="6" y1="12" x2="10" y2="12" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                {Object.values(filters).filter((v) => v !== "").length}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Search Panel */}
        {showAdvanced && (
          <div className="mt-3 rounded-lg border border-border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-foreground">Advanced Search</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
              {/* Mill */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mill</label>
                <select
                  value={filters.millId}
                  onChange={(e) => updateFilter("millId", e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-2.5 py-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">All mills</option>
                  {sortedMills.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Composition */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Composition</label>
                <input
                  type="text"
                  value={filters.composition}
                  onChange={(e) => updateFilter("composition", e.target.value)}
                  placeholder="e.g. cotton, polyester"
                  className="w-full rounded-md border border-border px-2.5 py-2 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Payment Terms */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payment Terms</label>
                <select
                  value={filters.paymentTerms}
                  onChange={(e) => updateFilter("paymentTerms", e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-2.5 py-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Any</option>
                  {PAYMENT_TERMS_OPTIONS.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>

              {/* Weight Range */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Weight (g)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={filters.weightMin}
                    onChange={(e) => updateFilter("weightMin", e.target.value)}
                    placeholder="Min"
                    className="w-full rounded-md border border-border px-2.5 py-2 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[11px] text-muted-foreground">–</span>
                  <input
                    type="number"
                    value={filters.weightMax}
                    onChange={(e) => updateFilter("weightMax", e.target.value)}
                    placeholder="Max"
                    className="w-full rounded-md border border-border px-2.5 py-2 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price ($/yd)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    value={filters.priceMin}
                    onChange={(e) => updateFilter("priceMin", e.target.value)}
                    placeholder="Min"
                    className="w-full rounded-md border border-border px-2.5 py-2 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[11px] text-muted-foreground">–</span>
                  <input
                    type="number"
                    step="0.5"
                    value={filters.priceMax}
                    onChange={(e) => updateFilter("priceMax", e.target.value)}
                    placeholder="Max"
                    className="w-full rounded-md border border-border px-2.5 py-2 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* MOQ Range */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">MOQ (yds)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={filters.moqMin}
                    onChange={(e) => updateFilter("moqMin", e.target.value)}
                    placeholder="Min"
                    className="w-full rounded-md border border-border px-2.5 py-2 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[11px] text-muted-foreground">–</span>
                  <input
                    type="number"
                    value={filters.moqMax}
                    onChange={(e) => updateFilter("moqMax", e.target.value)}
                    placeholder="Max"
                    className="w-full rounded-md border border-border px-2.5 py-2 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-1.5 text-[11px] text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} across{" "}
          {millCount} mill{millCount !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Results Table */}
      <div className="min-w-[1010px] overflow-hidden rounded-lg border border-border bg-white">
        {/* Header */}
        <div className="grid grid-cols-[120px_90px_120px_80px_90px_90px_90px_160px_170px] border-b-2 border-border bg-muted text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          {columns.map((col) => (
            <div key={col} className="px-3 py-2.5">
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((fabric) => (
          <div
            key={fabric.id}
            onClick={() =>
              onNavigate({ page: "mill-detail", millId: fabric.millId })
            }
            className="grid cursor-pointer grid-cols-[120px_90px_120px_80px_90px_90px_90px_160px_170px] border-b border-border/50 text-[12px] last:border-b-0 hover:bg-background"
          >
            <div className="px-3 py-3 font-semibold text-accent">
              {getMillName(fabric.millId)}
            </div>
            <div className="px-3 py-3">{fabric.artNumber}</div>
            <div
              className={cn(
                "px-3 py-3",
                fabric.composition === "(pending)" &&
                  "italic text-muted-foreground"
              )}
            >
              {fabric.composition}
            </div>
            <div
              className={cn(
                "px-3 py-3",
                fabric.weight === "-" && "text-muted-foreground"
              )}
            >
              {fabric.weight}
            </div>
            <div className="px-3 py-3">{fabric.price}</div>
            <div className="px-3 py-3 text-[11px]">{fabric.moq}</div>
            <div className="px-3 py-3 text-[11px]">{fabric.moc}</div>
            <div className="px-3 py-3 text-[11px] text-muted-foreground">
              {fabric.paymentTerms}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-3">
              <span className="text-[11px]">{fabric.contactEmail}</span>
              <button
                onClick={(e) => copyEmail(e, fabric)}
                className="text-[13px] text-primary hover:text-primary/80"
                title="Copy email"
              >
                {copiedId === fabric.id ? "✓" : "📋"}
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="px-3 py-8 text-center text-[13px] text-muted-foreground">
            No fabrics match your search.
          </div>
        )}
      </div>

      <div className="mt-2 text-[11px] text-muted-foreground">
        Click a row to open mill record. Click 📋 to copy email.
      </div>
    </div>
  );
}
