import { useState } from "react";
import type { View } from "./types";
import { Sidebar } from "./Sidebar";
import { FabricSearch } from "./FabricSearch";
import { MillsList } from "./MillsList";
import { MillDetail } from "./MillDetail";

export default function FabricOrganizer() {
  const [view, setView] = useState<View>({ page: "search" });

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar currentView={view} onNavigate={setView} />

      {view.page === "search" && <FabricSearch onNavigate={setView} />}
      {view.page === "mills" && <MillsList onNavigate={setView} />}
      {view.page === "mill-detail" && (
        <MillDetail millId={view.millId} onNavigate={setView} />
      )}
    </div>
  );
}
