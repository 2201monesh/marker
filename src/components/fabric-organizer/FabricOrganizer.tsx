import { useState, useCallback, useRef } from "react";
import type { View, Mill, Fabric } from "./types";
import { MILLS as INITIAL_MILLS, FABRICS as INITIAL_FABRICS } from "./data";
import { Sidebar } from "./Sidebar";
import { FabricSearch } from "./FabricSearch";
import { MillsList } from "./MillsList";
import { MillDetail } from "./MillDetail";
import { AddMillModal } from "./AddMillModal";
import { AddFabricModal } from "./AddFabricModal";

export default function FabricOrganizer() {
  const [view, setView] = useState<View>({ page: "search" });
  const previousViewRef = useRef<View>({ page: "search" });
  const [mills, setMills] = useState<Mill[]>(INITIAL_MILLS);
  const [fabrics, setFabrics] = useState<Fabric[]>(INITIAL_FABRICS);
  const [modal, setModal] = useState<"mill" | "fabric" | null>(null);

  const navigate = useCallback((next: View) => {
    setView((current) => {
      if (next.page === "mill-detail") {
        previousViewRef.current = current;
      }
      return next;
    });
  }, []);

  const handleAddMill = (mill: Mill) => {
    setMills((prev) => [...prev, mill]);
    setModal(null);
    navigate({ page: "mill-detail", millId: mill.id });
  };

  const handleAddFabric = (fabric: Fabric) => {
    setFabrics((prev) => [...prev, fabric]);
    setModal(null);
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar
        currentView={view}
        onNavigate={navigate}
        onAddMill={() => setModal("mill")}
        onAddFabric={() => setModal("fabric")}
      />

      {view.page === "search" && (
        <FabricSearch mills={mills} fabrics={fabrics} onNavigate={navigate} />
      )}
      {view.page === "mills" && (
        <MillsList mills={mills} fabrics={fabrics} onNavigate={navigate} />
      )}
      {view.page === "mill-detail" && (
        <MillDetail
          millId={view.millId}
          mills={mills}
          fabrics={fabrics}
          previousView={previousViewRef.current}
          onNavigate={navigate}
        />
      )}

      {modal === "mill" && (
        <AddMillModal onClose={() => setModal(null)} onSave={handleAddMill} />
      )}
      {modal === "fabric" && (
        <AddFabricModal
          mills={mills}
          onClose={() => setModal(null)}
          onSave={handleAddFabric}
        />
      )}
    </div>
  );
}
