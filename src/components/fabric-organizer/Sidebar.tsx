import { cn } from "@/lib/utils";
import type { View } from "./types";

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onAddMill: () => void;
  onAddFabric: () => void;
}

export function Sidebar({ currentView, onNavigate, onAddMill, onAddFabric }: SidebarProps) {
  const isSearch = currentView.page === "search";
  const isMills =
    currentView.page === "mills" || currentView.page === "mill-detail";

  return (
    <aside className="sticky top-0 flex h-screen w-[180px] shrink-0 flex-col border-r border-border bg-muted px-3.5 py-5">
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

      <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
        <button
          onClick={onAddMill}
          className="rounded-md border border-primary bg-background px-3 py-2 text-[12px] font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          + Add Mill
        </button>
        <button
          onClick={onAddFabric}
          className="rounded-md border border-accent bg-background px-3 py-2 text-[12px] font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
        >
          + Add Fabric
        </button>
      </div>
    </aside>
  );
}
