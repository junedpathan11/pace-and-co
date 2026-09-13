"use client";

import { useFocusTrap } from "@/lib/useFocusTrap";
import { CloseIcon } from "@/components/ui/icons";

const CLOTHING = [
  { size: "XS", chest: "34\"", waist: "28\"" },
  { size: "S", chest: "36\"", waist: "30\"" },
  { size: "M", chest: "38\"", waist: "32\"" },
  { size: "L", chest: "40\"", waist: "34\"" },
  { size: "XL", chest: "42\"", waist: "36\"" },
  { size: "XXL", chest: "44\"", waist: "38\"" },
];

const FOOTWEAR = [
  { uk: "5", eu: "38", cm: "24.0" },
  { uk: "6", eu: "39", cm: "24.7" },
  { uk: "7", eu: "41", cm: "25.4" },
  { uk: "8", eu: "42", cm: "26.0" },
  { uk: "9", eu: "43", cm: "26.7" },
  { uk: "10", eu: "44", cm: "27.3" },
  { uk: "11", eu: "45", cm: "28.0" },
  { uk: "12", eu: "46", cm: "28.7" },
];

export default function SizeGuideModal({ onClose }: { onClose: () => void }) {
  const ref = useFocusTrap(true, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Size guide"
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-card bg-surface p-6 shadow-[var(--shadow-lift)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold uppercase">
            Size guide
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="grid h-10 w-10 place-items-center rounded-chip hover:bg-grey"
          >
            <CloseIcon />
          </button>
        </div>

        <section className="mb-6">
          <h3 className="eyebrow mb-3">Clothing (approximate)</h3>
          <div className="overflow-hidden rounded-img border border-border">
            <table className="w-full text-sm">
              <thead className="bg-grey text-left">
                <tr>
                  <th className="px-4 py-2 font-semibold">Size</th>
                  <th className="px-4 py-2 font-semibold">Chest</th>
                  <th className="px-4 py-2 font-semibold">Waist</th>
                </tr>
              </thead>
              <tbody>
                {CLOTHING.map((r) => (
                  <tr key={r.size} className="border-t border-border">
                    <td className="px-4 py-2 font-medium">{r.size}</td>
                    <td className="px-4 py-2 tabular">{r.chest}</td>
                    <td className="px-4 py-2 tabular">{r.waist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="eyebrow mb-3">Footwear (UK / EU / foot length)</h3>
          <div className="overflow-hidden rounded-img border border-border">
            <table className="w-full text-sm">
              <thead className="bg-grey text-left">
                <tr>
                  <th className="px-4 py-2 font-semibold">UK</th>
                  <th className="px-4 py-2 font-semibold">EU</th>
                  <th className="px-4 py-2 font-semibold">Foot (cm)</th>
                </tr>
              </thead>
              <tbody>
                {FOOTWEAR.map((r) => (
                  <tr key={r.uk} className="border-t border-border">
                    <td className="px-4 py-2 font-medium tabular">{r.uk}</td>
                    <td className="px-4 py-2 tabular">{r.eu}</td>
                    <td className="px-4 py-2 tabular">{r.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-4 text-xs text-muted">
          Sizes are a general fit guide only. If you&apos;re between sizes, we
          recommend sizing up — and remember, size exchange is free.
        </p>
      </div>
    </div>
  );
}
