import { StarIcon } from "./icons";

export function Rating({
  rating,
  reviewCount,
  size = 14,
  showCount = true,
}: {
  rating: number;
  reviewCount?: number;
  size?: number;
  showCount?: boolean;
}) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1.5 text-ink">
      <span className="flex text-primary" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon key={i} width={size} height={size} filled={i < full} />
        ))}
      </span>
      <span className="text-xs text-muted tabular">
        {rating.toFixed(1)}
        {showCount && reviewCount != null ? ` (${reviewCount})` : ""}
      </span>
    </span>
  );
}
