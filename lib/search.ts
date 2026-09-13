import type { Product } from "@/content/types";
import { products } from "@/content/products";

/** Lightweight fuzzy-ish search across multiple product fields. */
export function searchProducts(query: string, limit = 8): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const scored = products
    .map((p) => {
      const haystack = [
        p.name,
        p.brand,
        p.category,
        p.subcategory,
        p.productType,
        p.gender,
        ...p.tags,
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const t of terms) {
        if (p.name.toLowerCase().includes(t)) score += 5;
        else if (p.brand.toLowerCase().includes(t)) score += 4;
        else if (p.subcategory.toLowerCase().includes(t)) score += 3;
        else if (haystack.includes(t)) score += 2;
      }
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);

  return scored;
}

export const searchSuggestions = [
  "Sneakers",
  "Running shoes",
  "Hoodies",
  "Jeans",
  "Sale",
  "Men",
  "Women",
  "Kids",
  "Accessories",
];
