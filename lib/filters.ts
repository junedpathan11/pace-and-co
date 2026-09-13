import type { Product, ProductType, Gender } from "@/content/types";

export type SortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling";

export interface FilterState {
  productType?: ProductType;
  category?: string; // alias of productType when using /shop/[category]
  gender?: Gender;
  brands: string[];
  subcategories: string[];
  sizes: string[];
  colors: string[];
  fits: string[];
  materials: string[];
  minPrice?: number;
  maxPrice?: number;
  saleOnly: boolean;
  newOnly: boolean;
  inStockOnly: boolean;
  sort: SortKey;
  q?: string;
}

export const emptyFilters: FilterState = {
  brands: [],
  subcategories: [],
  sizes: [],
  colors: [],
  fits: [],
  materials: [],
  saleOnly: false,
  newOnly: false,
  inStockOnly: false,
  sort: "featured",
};

const PRODUCT_TYPES: ProductType[] = ["clothing", "footwear", "accessories"];
const GENDERS: Gender[] = ["men", "women", "kids", "unisex"];
const SORT_KEYS: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "best-selling"];

export function parseFilters(params: URLSearchParams): FilterState {
  const list = (key: string) =>
    params.get(key)?.split(",").filter(Boolean) ?? [];
  const num = (key: string) => {
    const raw = params.get(key);
    if (!raw) return undefined;
    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
  };
  const requestedType = params.get("productType") ?? params.get("category");
  const requestedGender = params.get("gender");
  const requestedSort = params.get("sort");

  return {
    productType: PRODUCT_TYPES.includes(requestedType as ProductType)
      ? (requestedType as ProductType)
      : undefined,
    gender: GENDERS.includes(requestedGender as Gender)
      ? (requestedGender as Gender)
      : undefined,
    brands: list("brand"),
    subcategories: list("subcategory"),
    sizes: list("size"),
    colors: list("color"),
    fits: list("fit"),
    materials: list("material"),
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    saleOnly: params.get("sale") === "true",
    newOnly: params.get("new") === "true",
    inStockOnly: params.get("inStock") === "true",
    sort: SORT_KEYS.includes(requestedSort as SortKey)
      ? (requestedSort as SortKey)
      : "featured",
    q: params.get("q") || undefined,
  };
}

export function serializeFilters(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.productType) p.set("productType", f.productType);
  if (f.gender) p.set("gender", f.gender);
  if (f.brands.length) p.set("brand", f.brands.join(","));
  if (f.subcategories.length) p.set("subcategory", f.subcategories.join(","));
  if (f.sizes.length) p.set("size", f.sizes.join(","));
  if (f.colors.length) p.set("color", f.colors.join(","));
  if (f.fits.length) p.set("fit", f.fits.join(","));
  if (f.materials.length) p.set("material", f.materials.join(","));
  if (f.minPrice != null) p.set("minPrice", String(f.minPrice));
  if (f.maxPrice != null) p.set("maxPrice", String(f.maxPrice));
  if (f.saleOnly) p.set("sale", "true");
  if (f.newOnly) p.set("new", "true");
  if (f.inStockOnly) p.set("inStock", "true");
  if (f.sort && f.sort !== "featured") p.set("sort", f.sort);
  if (f.q) p.set("q", f.q);
  return p;
}

function hasStock(p: Product): boolean {
  return p.stock !== "out";
}

export function applyFilters(
  all: Product[],
  f: FilterState,
  effectiveType?: ProductType
): Product[] {
  const type = effectiveType || f.productType;
  let out = all.slice();

  if (type) out = out.filter((p) => p.productType === type);
  // A gender destination is intentionally exact. Unisex products remain
  // available from Shop/Accessories and via the explicit Unisex filter.
  if (f.gender) out = out.filter((p) => p.gender === f.gender);
  if (f.brands.length) out = out.filter((p) => f.brands.includes(p.brand));
  if (f.subcategories.length)
    out = out.filter((p) => f.subcategories.includes(p.subcategory));
  if (f.colors.length)
    out = out.filter((p) => p.colors.some((c) => f.colors.includes(c.name)));
  if (f.sizes.length)
    out = out.filter((p) =>
      p.variants.some((v) => f.sizes.includes(v.size) && v.stock !== "out")
    );
  if (f.fits.length)
    out = out.filter(
      (p) => p.clothingExtras && f.fits.includes(p.clothingExtras.fit)
    );
  if (f.materials.length)
    out = out.filter(
      (p) =>
        p.clothingExtras &&
        f.materials.some((m) =>
          p.clothingExtras!.material.toLowerCase().includes(m.toLowerCase())
        )
    );
  if (f.minPrice != null) out = out.filter((p) => p.price >= f.minPrice!);
  if (f.maxPrice != null) out = out.filter((p) => p.price <= f.maxPrice!);
  if (f.saleOnly) out = out.filter((p) => p.badge === "sale" || p.compareAtPrice);
  if (f.newOnly) out = out.filter((p) => p.badge === "new");
  if (f.inStockOnly) out = out.filter(hasStock);

  switch (f.sort) {
    case "newest":
      out.sort((a, b) => (b.badge === "new" ? 1 : 0) - (a.badge === "new" ? 1 : 0));
      break;
    case "price-asc":
      out.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      out.sort((a, b) => b.price - a.price);
      break;
    case "best-selling":
      out.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    default:
      out.sort((a, b) => {
        const af = (a.badge ? 1 : 0) + a.rating / 10;
        const bf = (b.badge ? 1 : 0) + b.rating / 10;
        return bf - af;
      });
  }
  return out;
}

export const materialOptions = ["Cotton", "Linen", "Polyester", "Fleece", "Denim", "Nylon"];
export const fitOptions: Array<{ value: string; label: string }> = [
  { value: "regular", label: "Regular" },
  { value: "slim", label: "Slim" },
  { value: "oversized", label: "Oversized" },
];
