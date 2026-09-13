import type { Product, ProductType } from "@/content/types";

export interface Facets {
  brands: string[];
  subcategories: string[];
  colors: { name: string; hex: string }[];
  alphaSizes: string[];
  numericSizes: string[];
  shoeSizes: string[];
  priceMin: number;
  priceMax: number;
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

/**
 * Compute the available facet values from a set of products. Filters adapt to
 * whatever is actually present in the current view (so no irrelevant options).
 */
export function computeFacets(list: Product[]): Facets {
  const brands = new Set<string>();
  const subcategories = new Set<string>();
  const colorMap = new Map<string, string>();
  const alpha = new Set<string>();
  const numeric = new Set<string>();
  const shoe = new Set<string>();
  let priceMin = Infinity;
  let priceMax = 0;

  for (const p of list) {
    brands.add(p.brand);
    subcategories.add(p.subcategory);
    p.colors.forEach((c) => colorMap.set(c.name, c.hex));
    priceMin = Math.min(priceMin, p.price);
    priceMax = Math.max(priceMax, p.price);
    if (p.sizeType === "alpha") p.variants.forEach((v) => alpha.add(v.size));
    else if (p.sizeType === "numeric") p.variants.forEach((v) => numeric.add(v.size));
    else if (p.sizeType === "shoe") p.variants.forEach((v) => shoe.add(v.size));
  }

  const sortAlpha = (arr: string[]) =>
    arr.sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
  const sortNum = (arr: string[]) =>
    arr.sort((a, b) => Number(a) - Number(b));

  return {
    brands: Array.from(brands).sort(),
    subcategories: Array.from(subcategories).sort(),
    colors: Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex })),
    alphaSizes: sortAlpha(Array.from(alpha)),
    numericSizes: sortNum(Array.from(numeric)),
    shoeSizes: sortNum(Array.from(shoe)),
    priceMin: priceMin === Infinity ? 0 : Math.floor(priceMin / 100) * 100,
    priceMax: Math.ceil(priceMax / 100) * 100,
  };
}

/** Which extra filter groups apply for a given product type in view. */
export function relevantGroups(type?: ProductType) {
  return {
    showClothingSizes: !type || type === "clothing",
    showShoeSizes: !type || type === "footwear",
    showFit: !type || type === "clothing",
    showMaterial: !type || type === "clothing",
    // accessories: no size/fit/material — handled by the two above being false
    isAccessories: type === "accessories",
  };
}
