import { useState } from "react";
import type { View, Mill, Fabric } from "./types";

interface MillsListProps {
  mills: Mill[];
  fabrics: Fabric[];
  onNavigate: (view: View) => void;
}

export function MillsList({ mills, fabrics, onNavigate }: MillsListProps) {
  const [query, setQuery] = useState("");

  const filtered = mills.filter((m) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q)
    );
  });

  const getFabricCount = (millId: string) =>
    fabrics.filter((f) => f.millId === millId).length;

  return (
    <div className="flex-1 p-6 md:p-7">
      <h1 className="mb-4 text-[22px] font-bold text-foreground">Mills</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search mills..."
        className="mb-4 w-full max-w-[400px] rounded-lg border border-border bg-white px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <div className="flex flex-col gap-2.5">
        {filtered.map((mill) => (
          <button
            key={mill.id}
            onClick={() =>
              onNavigate({ page: "mill-detail", millId: mill.id })
            }
            className="flex items-center justify-between rounded-lg border border-border bg-white px-[18px] py-3.5 text-left transition-colors hover:border-primary"
          >
            <div>
              <div className="text-[15px] font-bold text-accent">
                {mill.name}
              </div>
              <div className="mt-0.5 text-[12px] text-muted-foreground">
                {mill.location}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-foreground">
                {getFabricCount(mill.id)} fabric
                {getFabricCount(mill.id) !== 1 ? "s" : ""}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Last active {mill.lastActive}
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="py-8 text-center text-[13px] text-muted-foreground">
            No mills match your search.
          </div>
        )}
      </div>
    </div>
  );
}
