"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { Product, ProductType } from "@/content/types";
import {
  parseFilters,
  serializeFilters,
  applyFilters,
  type FilterState,
  type SortKey,
} from "@/lib/filters";
import { computeFacets } from "@/lib/facets";
import ProductCard from "@/components/product/ProductCard";
import FilterControls from "./FilterControls";
import { FilterIcon, CloseIcon, ChevronDown } from "@/components/ui/icons";
import { useFocusTrap } from "@/lib/useFocusTrap";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
];

export default function ShopClient({
  allProducts,
  lockedType,
  heading,
}: {
  allProducts: Product[];
  lockedType?: ProductType;
  heading: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  const effectiveType = lockedType || filters.productType;

  const drawerRef = useFocusTrap(drawerOpen, () => setDrawerOpen(false));

  // Facets computed from the type-scoped catalogue (adaptive).
  const facetBase = useMemo(() => {
    let base = allProducts;
    if (effectiveType) base = base.filter((p) => p.productType === effectiveType);
    return base;
  }, [allProducts, effectiveType]);
  const facets = useMemo(() => computeFacets(facetBase), [facetBase]);

  // Text search applied first (from ?q)
  const searchScoped = useMemo(() => {
    if (!filters.q) return allProducts;
    const q = filters.q.toLowerCase();
    return allProducts.filter((p) =>
      [p.name, p.brand, p.category, p.subcategory, p.productType, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [allProducts, filters.q]);

  const results = useMemo(
    () => applyFilters(searchScoped, filters, lockedType),
    [searchScoped, filters, lockedType]
  );

  const pushFilters = useCallback(
    (next: FilterState) => {
      const params = serializeFilters(next);
      if (filters.q) params.set("q", filters.q);
      setLoading(true);
      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
        setTimeout(() => setLoading(false), 220);
      });
    },
    [router, filters.q]
  );

  const update = useCallback(
    (patch: Partial<FilterState>) => {
      pushFilters({ ...filters, ...patch });
    },
    [filters, pushFilters]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    setLoading(true);
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
      setTimeout(() => setLoading(false), 220);
    });
  }, [router, filters.q]);

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (filters.productType && !lockedType)
      chips.push({
        label: filters.productType,
        onRemove: () => update({ productType: undefined }),
      });
    if (filters.gender)
      chips.push({ label: filters.gender, onRemove: () => update({ gender: undefined }) });
    filters.subcategories.forEach((s) =>
      chips.push({
        label: s,
        onRemove: () =>
          update({ subcategories: filters.subcategories.filter((x) => x !== s) }),
      })
    );
    filters.brands.forEach((b) =>
      chips.push({
        label: b,
        onRemove: () => update({ brands: filters.brands.filter((x) => x !== b) }),
      })
    );
    filters.colors.forEach((c) =>
      chips.push({
        label: c,
        onRemove: () => update({ colors: filters.colors.filter((x) => x !== c) }),
      })
    );
    filters.sizes.forEach((s) =>
      chips.push({
        label: `Size ${s}`,
        onRemove: () => update({ sizes: filters.sizes.filter((x) => x !== s) }),
      })
    );
    filters.fits.forEach((f) =>
      chips.push({
        label: f,
        onRemove: () => update({ fits: filters.fits.filter((x) => x !== f) }),
      })
    );
    filters.materials.forEach((m) =>
      chips.push({
        label: m,
        onRemove: () => update({ materials: filters.materials.filter((x) => x !== m) }),
      })
    );
    if (filters.minPrice != null || filters.maxPrice != null)
      chips.push({
        label: `₹${filters.minPrice ?? 0}–${filters.maxPrice ?? "∞"}`,
        onRemove: () => update({ minPrice: undefined, maxPrice: undefined }),
      });
    if (filters.saleOnly)
      chips.push({ label: "On sale", onRemove: () => update({ saleOnly: false }) });
    if (filters.inStockOnly)
      chips.push({ label: "In stock", onRemove: () => update({ inStockOnly: false }) });
    return chips;
  }, [filters, lockedType, update]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="eyebrow">Shop</p>
        <h1 className="display-section mt-2">{heading}</h1>
        {filters.q && (
          <p className="mt-2 text-sm text-muted">
            Results for “{filters.q}”
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="btn btn-secondary lg:hidden"
          aria-label="Open filters"
        >
          <FilterIcon width={16} height={16} /> Filters
        </button>
        <p className="hidden text-sm text-muted lg:block tabular">
          {results.length} {results.length === 1 ? "product" : "products"}
        </p>
        <div className="relative ml-auto flex items-center gap-2">
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <div className="relative">
            <select
              id="sort"
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as SortKey })}
              className="appearance-none rounded-chip border border-border bg-surface py-2.5 pl-4 pr-10 text-sm outline-none focus:border-ink"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown
              width={16}
              height={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
        </div>
      </div>

      {/* Active chips */}
      {activeChips.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {activeChips.map((chip, i) => (
            <button
              key={`${chip.label}-${i}`}
              type="button"
              onClick={chip.onRemove}
              className="chip capitalize"
              data-active="true"
            >
              {chip.label}
              <CloseIcon width={12} height={12} />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <FilterControls
            facets={facets}
            filters={filters}
            effectiveType={effectiveType}
            lockType={!!lockedType}
            update={update}
          />
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-muted lg:hidden tabular">
            {results.length} {results.length === 1 ? "product" : "products"}
          </p>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] w-full rounded-img bg-grey" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-grey" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-grey" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-card bg-grey py-20 text-center">
              <p className="font-display text-2xl font-extrabold uppercase">
                Nothing here — yet
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted">
                No products match these filters. Try removing a few, or clear
                everything to start fresh.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="btn btn-primary mt-6"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-surface shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-lg font-extrabold uppercase">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="grid h-10 w-10 place-items-center rounded-chip hover:bg-grey"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              <FilterControls
                facets={facets}
                filters={filters}
                effectiveType={effectiveType}
                lockType={!!lockedType}
                update={update}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={clearAll}
                className="btn btn-secondary w-full"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="btn btn-primary w-full"
              >
                Show {results.length}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
