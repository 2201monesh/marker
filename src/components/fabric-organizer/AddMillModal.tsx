import { useState } from "react";
import type { Mill } from "./types";

interface AddMillModalProps {
  onClose: () => void;
  onSave: (mill: Mill) => void;
}

export function AddMillModal({ onClose, onSave }: AddMillModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [repName, setRepName] = useState("");
  const [repRole, setRepRole] = useState("");
  const [repEmail, setRepEmail] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    const mill: Mill = {
      id: `mill-${Date.now()}`,
      name: name.trim(),
      location: location.trim(),
      lastActive: "Apr 2026",
      representatives: repName.trim()
        ? [
            {
              id: `rep-${Date.now()}`,
              name: repName.trim(),
              role: repRole.trim() || "(role unknown)",
              email: repEmail.trim(),
            },
          ]
        : [],
      notes: [],
      emailThreads: [],
    };
    onSave(mill);
  };

  const inputClass =
    "w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[440px] rounded-xl border border-border bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-[18px] font-bold text-foreground">Add Mill</h2>

        <div className="mb-3">
          <label className={labelClass}>Mill Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Olah Inc."
            className={inputClass}
            autoFocus
          />
        </div>

        <div className="mb-4">
          <label className={labelClass}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Shanghai, China"
            className={inputClass}
          />
        </div>

        <div className="mb-4 rounded-md border border-border bg-background p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
            Primary Contact (optional)
          </div>
          <div className="mb-2">
            <input
              type="text"
              value={repName}
              onChange={(e) => setRepName(e.target.value)}
              placeholder="Contact name"
              className={inputClass}
            />
          </div>
          <div className="mb-2">
            <input
              type="text"
              value={repRole}
              onChange={(e) => setRepRole(e.target.value)}
              placeholder="Role (e.g. Sales Manager)"
              className={inputClass}
            />
          </div>
          <div>
            <input
              type="email"
              value={repEmail}
              onChange={(e) => setRepEmail(e.target.value)}
              placeholder="Email"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-40"
          >
            Add Mill
          </button>
        </div>
      </div>
    </div>
  );
}
