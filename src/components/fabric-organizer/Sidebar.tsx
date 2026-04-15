import { cn } from "@/lib/utils";
import type { View } from "./types";

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const isSearch = currentView.page === "search";
  const isMills =
    currentView.page === "mills" || currentView.page === "mill-detail";

  return (
    <aside className="flex w-[180px] shrink-0 flex-col border-r border-border bg-muted px-3.5 py-5">
      <div className="mb-6 text-[13px] font-bold uppercase tracking-[1.5px] text-primary">
        Fabric Organizer
      </div>

      <button
        onClick={() => onNavigate({ page: "search" })}
        className={cn(
          "mb-1 rounded-md px-3 py-2 text-left text-[13px]",
          isSearch
            ? "border border-primary bg-background font-semibold text-primary"
            : "text-muted-foreground hover:bg-background"
        )}
      >
        Fabric Search
      </button>
      <button
        onClick={() => onNavigate({ page: "mills" })}
        className={cn(
          "rounded-md px-3 py-2 text-left text-[13px]",
          isMills
            ? "border border-accent bg-background font-semibold text-accent"
            : "text-muted-foreground hover:bg-background"
        )}
      >
        Mills
      </button>

      <div className="mt-auto border-t border-border pt-4">
        <button
          className="block px-3 py-2 text-[12px] text-primary"
          onClick={() => {}}
          title="Coming soon"
        >
          + Add Mill
        </button>
        <button
          className="block px-3 py-2 text-[12px] text-primary"
          onClick={() => {}}
          title="Coming soon"
        >
          + Add Fabric
        </button>
      </div>
    </aside>
  );
}
