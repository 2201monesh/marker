import { useState, useCallback, useRef } from "react";
import type { View } from "./types";
import { Sidebar } from "./Sidebar";
import { FabricSearch } from "./FabricSearch";
import { MillsList } from "./MillsList";
import { MillDetail } from "./MillDetail";

export default function FabricOrganizer() {
  const [view, setView] = useState<View>({ page: "search" });
  const previousViewRef = useRef<View>({ page: "search" });

  const navigate = useCallback((next: View) => {
    setView((current) => {
      if (next.page === "mill-detail") {
        previousViewRef.current = current;
      }
      return next;
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar currentView={view} onNavigate={navigate} />

      {view.page === "search" && <FabricSearch onNavigate={navigate} />}
      {view.page === "mills" && <MillsList onNavigate={navigate} />}
      {view.page === "mill-detail" && (
        <MillDetail
          millId={view.millId}
          previousView={previousViewRef.current}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
