import { formatINR } from "@/lib/whatsapp";

export function Price({
  price,
  compareAtPrice,
  size = "base",
}: {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "base" | "lg";
}) {
  const cls =
    size === "lg"
      ? "text-2xl"
      : size === "sm"
        ? "text-sm"
        : "text-base";
  const onSale = compareAtPrice && compareAtPrice > price;
  return (
    <span className={`tabular inline-flex items-baseline gap-2 ${cls}`}>
      <span className={`font-semibold ${onSale ? "text-primary" : "text-ink"}`}>
        {formatINR(price)}
      </span>
      {onSale && (
        <span className="text-muted line-through text-[0.8em] font-normal">
          {formatINR(compareAtPrice!)}
        </span>
      )}
    </span>
  );
}
