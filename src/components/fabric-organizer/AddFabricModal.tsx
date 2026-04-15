import { useState } from "react";
import type { Mill, Fabric } from "./types";

interface AddFabricModalProps {
  mills: Mill[];
  onClose: () => void;
  onSave: (fabric: Fabric) => void;
}

export function AddFabricModal({ mills, onClose, onSave }: AddFabricModalProps) {
  const [millId, setMillId] = useState(mills[0]?.id ?? "");
  const [artNumber, setArtNumber] = useState("");
  const [name, setName] = useState("");
  const [composition, setComposition] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [moq, setMoq] = useState("");
  const [moc, setMoc] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const handleSave = () => {
    if (!artNumber.trim() || !millId) return;
    const fabric: Fabric = {
      id: `fab-${Date.now()}`,
      millId,
      artNumber: artNumber.trim(),
      name: name.trim(),
      composition: composition.trim() || "-",
      weight: weight.trim() || "-",
      price: price.trim() || "-",
      moq: moq.trim() || "-",
      moc: moc.trim() || "-",
      paymentTerms: paymentTerms.trim() || "-",
      contactEmail: contactEmail.trim(),
    };
    onSave(fabric);
  };

  const inputClass =
    "w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-xl border border-border bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-[18px] font-bold text-foreground">Add Fabric</h2>

        <div className="mb-3">
          <label className={labelClass}>Mill *</label>
          <select
            value={millId}
            onChange={(e) => setMillId(e.target.value)}
            className={inputClass}
          >
            {mills.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className={labelClass}>Art # *</label>
          <input
            type="text"
            value={artNumber}
            onChange={(e) => setArtNumber(e.target.value)}
            placeholder="e.g. VV41023"
            className={inputClass}
            autoFocus
          />
        </div>

        <div className="mb-3">
          <label className={labelClass}>Fabric Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Velvet"
            className={inputClass}
          />
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Composition</label>
            <input
              type="text"
              value={composition}
              onChange={(e) => setComposition(e.target.value)}
              placeholder="e.g. 100% Cotton"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Weight</label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 180g"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Price</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. $10.50/yd"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>MOQ</label>
            <input
              type="text"
              value={moq}
              onChange={(e) => setMoq(e.target.value)}
              placeholder="e.g. 3,000 yds"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>MOC</label>
            <input
              type="text"
              value={moc}
              onChange={(e) => setMoc(e.target.value)}
              placeholder="e.g. 1,100/color"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className={labelClass}>Payment Terms</label>
          <input
            type="text"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            placeholder="e.g. T/T advance, L/C at sight"
            className={inputClass}
          />
        </div>

        <div className="mb-4">
          <label className={labelClass}>Contact Email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="e.g. william@olah.com"
            className={inputClass}
          />
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
            disabled={!artNumber.trim() || !millId}
            className="rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent/90 disabled:opacity-40"
          >
            Add Fabric
          </button>
        </div>
      </div>
    </div>
  );
}
