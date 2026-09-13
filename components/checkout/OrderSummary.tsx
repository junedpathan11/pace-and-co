"use client";

import Image from "next/image";
import { site } from "@/content/site";
import { formatINR } from "@/lib/whatsapp";
import type { CartTotals } from "@/lib/cart";

export interface SummaryLine {
  key: string;
  name: string;
  brand: string;
  image: string;
  color: string;
  sizeLabel: string;
  qty: number;
  price: number;
  lineTotal: number;
}

/**
 * Order summary used by checkout and the confirmation page.
 * Totals are always passed in from `cartTotals()` / the order snapshot —
 * this component never recalculates pricing.
 */
export default function OrderSummary({
  lines,
  totals,
  heading = "Order summary",
}: {
  lines: SummaryLine[];
  totals: Pick<CartTotals, "subtotal" | "savings" | "delivery" | "total">;
  heading?: string;
}) {
  return (
    <div>
      <h2 className="font-display text-xl font-extrabold uppercase">{heading}</h2>

      <ul className="mt-4 divide-y divide-border border-y border-border">
        {lines.map((line) => (
          <li key={line.key} className="flex gap-3 py-4">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-img bg-grey">
              <Image
                src={line.image}
                alt={line.name}
                fill
                sizes="64px"
                className="object-cover"
              />
              <span
                className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-chip bg-ink px-1 text-[0.625rem] font-bold text-white tabular"
                aria-hidden
              >
                {line.qty}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="eyebrow">{line.brand}</p>
              <p className="text-sm font-medium break-words">{line.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                {line.sizeLabel} · {line.color}
              </p>
              <p className="mt-1 text-xs text-muted tabular">
                Qty {line.qty} × {formatINR(line.price)}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular">
              {formatINR(line.lineTotal)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular font-medium">{formatINR(totals.subtotal)}</dd>
        </div>
        {totals.savings > 0 && (
          <div className="flex justify-between gap-4 text-primary">
            <dt>Discount</dt>
            <dd className="tabular font-medium">−{formatINR(totals.savings)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Delivery</dt>
          <dd className="tabular font-medium">
            {totals.delivery === 0 ? "Free" : formatINR(totals.delivery)}
          </dd>
        </div>
        <div className="mt-2 flex justify-between gap-4 border-t border-border pt-3 text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="tabular font-semibold">{formatINR(totals.total)}</dd>
        </div>
      </dl>

      {totals.delivery === 0 && totals.subtotal > 0 && (
        <p className="mt-3 text-xs text-muted">
          Free standard delivery on orders above{" "}
          {formatINR(site.freeDeliveryThreshold)}.
        </p>
      )}
    </div>
  );
}
