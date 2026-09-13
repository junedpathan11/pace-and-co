import type { Badge } from "@/content/types";

export function ProductBadge({ badge }: { badge?: Badge }) {
  if (!badge) return null;
  if (badge === "sale") {
    return <span className="badge-sale">Sale</span>;
  }
  return <span className="badge-new">New</span>;
}

export function StockPill({ stock }: { stock: "in_stock" | "low" | "out" }) {
  if (stock === "in_stock") return null;
  if (stock === "out") {
    return (
      <span className="inline-block rounded-chip bg-grey px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-muted">
        Sold out
      </span>
    );
  }
  return (
    <span className="inline-block rounded-chip bg-ink/90 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-white">
      Low stock
    </span>
  );
}
