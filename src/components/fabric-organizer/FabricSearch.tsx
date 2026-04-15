import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FABRICS, MILLS } from "./data";
import type { View, Fabric } from "./types";

interface FabricSearchProps {
  onNavigate: (view: View) => void;
}

export function FabricSearch({ onNavigate }: FabricSearchProps) {
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = FABRICS.filter((f) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const mill = MILLS.find((m) => m.id === f.millId);
    return (
      f.artNumber.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      f.composition.toLowerCase().includes(q) ||
      (mill?.name.toLowerCase().includes(q) ?? false)
    );
  });

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
    MILLS.find((m) => m.id === millId)?.name ?? "";

  const columns = [
    "Mill",
    "Art #",
    "Composition",
    "Weight",
    "Price",
    "Payment Terms",
    "Contact",
  ] as const;

  return (
    <div className="flex-1 overflow-x-auto p-6 md:p-7">
      {/* Search Bar */}
      <div className="mb-5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fabrics, mills, compositions, art #s..."
          className="w-full max-w-[500px] rounded-lg border border-border bg-white px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} across{" "}
          {millCount} mill{millCount !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Results Table */}
      <div className="min-w-[900px] overflow-hidden rounded-lg border border-border bg-white">
        {/* Header */}
        <div className="grid grid-cols-[130px_90px_150px_80px_110px_170px_180px] border-b-2 border-border bg-muted text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
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
            className="grid cursor-pointer grid-cols-[130px_90px_150px_80px_110px_170px_180px] border-b border-border/50 text-[12px] last:border-b-0 hover:bg-background"
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
