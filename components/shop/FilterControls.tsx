"use client";

import type { Facets } from "@/lib/facets";
import { relevantGroups } from "@/lib/facets";
import type { FilterState } from "@/lib/filters";
import { fitOptions } from "@/lib/filters";
import type { ProductType } from "@/content/types";

interface Props {
  facets: Facets;
  filters: FilterState;
  effectiveType?: ProductType;
  lockType?: boolean; // when on /shop/[category], type is fixed
  update: (patch: Partial<FilterState>) => void;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border py-5">
      <h3 className="eyebrow mb-3">{title}</h3>
      {children}
    </div>
  );
}

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function FilterControls({
  facets,
  filters,
  effectiveType,
  lockType,
  update,
}: Props) {
  const groups = relevantGroups(effectiveType);

  const pricePresets = [
    { label: "Under ₹1,500", min: undefined, max: 1500 },
    { label: "₹1,500 – ₹3,000", min: 1500, max: 3000 },
    { label: "₹3,000 – ₹5,000", min: 3000, max: 5000 },
    { label: "Over ₹5,000", min: 5000, max: undefined },
  ];

  return (
    <div>
      {/* Product type (hidden when locked to a category route) */}
      {!lockType && (
        <Section title="Product type">
          <div className="flex flex-wrap gap-2">
            {(["clothing", "footwear", "accessories"] as ProductType[]).map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  className="chip capitalize"
                  data-active={filters.productType === t}
                  onClick={() =>
                    update({
                      productType: filters.productType === t ? undefined : t,
                      // reset type-specific filters on switch
                      sizes: [],
                      fits: [],
                      materials: [],
                      subcategories: [],
                    })
                  }
                >
                  {t}
                </button>
              )
            )}
          </div>
        </Section>
      )}

      {/* Gender */}
      <Section title="Gender">
        <div className="flex flex-wrap gap-2">
          {(["men", "women", "kids", "unisex"] as const).map((g) => (
            <button
              key={g}
              type="button"
              className="chip capitalize"
              data-active={filters.gender === g}
              onClick={() =>
                update({ gender: filters.gender === g ? undefined : g })
              }
            >
              {g}
            </button>
          ))}
        </div>
      </Section>

      {/* Subcategory */}
      {facets.subcategories.length > 1 && (
        <Section title="Category">
          <div className="flex flex-wrap gap-2">
            {facets.subcategories.map((s) => (
              <button
                key={s}
                type="button"
                className="chip capitalize"
                data-active={filters.subcategories.includes(s)}
                onClick={() =>
                  update({ subcategories: toggle(filters.subcategories, s) })
                }
              >
                {s}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Brand */}
      <Section title="Brand">
        <div className="flex flex-wrap gap-2">
          {facets.brands.map((b) => (
            <button
              key={b}
              type="button"
              className="chip"
              data-active={filters.brands.includes(b)}
              onClick={() => update({ brands: toggle(filters.brands, b) })}
            >
              {b}
            </button>
          ))}
        </div>
      </Section>

      {/* Price */}
      <Section title="Price">
        <div className="mb-3 flex flex-wrap gap-2">
          {pricePresets.map((p) => {
            const active =
              filters.minPrice === p.min && filters.maxPrice === p.max;
            return (
              <button
                key={p.label}
                type="button"
                className="chip"
                data-active={active}
                onClick={() =>
                  update(
                    active
                      ? { minPrice: undefined, maxPrice: undefined }
                      : { minPrice: p.min, maxPrice: p.max }
                  )
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="minPrice">
            Minimum price
          </label>
          <input
            id="minPrice"
            type="number"
            inputMode="numeric"
            placeholder={`₹${facets.priceMin}`}
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              update({
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-chip border border-border bg-surface px-3 py-2 text-sm tabular outline-none focus:border-ink"
          />
          <span className="text-muted">–</span>
          <label className="sr-only" htmlFor="maxPrice">
            Maximum price
          </label>
          <input
            id="maxPrice"
            type="number"
            inputMode="numeric"
            placeholder={`₹${facets.priceMax}`}
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              update({
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-chip border border-border bg-surface px-3 py-2 text-sm tabular outline-none focus:border-ink"
          />
        </div>
      </Section>

      {/* Color */}
      {facets.colors.length > 0 && (
        <Section title="Color">
          <div className="flex flex-wrap gap-2.5">
            {facets.colors.map((c) => {
              const active = filters.colors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={active}
                  onClick={() => update({ colors: toggle(filters.colors, c.name) })}
                  className={`h-8 w-8 rounded-chip border-2 transition-transform ${
                    active
                      ? "border-ink scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
          </div>
        </Section>
      )}

      {/* Clothing sizes */}
      {groups.showClothingSizes &&
        (facets.alphaSizes.length > 0 || facets.numericSizes.length > 0) && (
          <Section title="Size">
            <div className="flex flex-wrap gap-2">
              {[...facets.alphaSizes, ...facets.numericSizes].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip"
                  data-active={filters.sizes.includes(s)}
                  onClick={() => update({ sizes: toggle(filters.sizes, s) })}
                >
                  {s}
                </button>
              ))}
            </div>
          </Section>
        )}

      {/* Shoe sizes */}
      {groups.showShoeSizes && facets.shoeSizes.length > 0 && (
        <Section title="Shoe size (UK)">
          <div className="flex flex-wrap gap-2">
            {facets.shoeSizes.map((s) => (
              <button
                key={s}
                type="button"
                className="chip"
                data-active={filters.sizes.includes(s)}
                onClick={() => update({ sizes: toggle(filters.sizes, s) })}
              >
                {s}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Fit (clothing only) */}
      {groups.showFit && (
        <Section title="Fit">
          <div className="flex flex-wrap gap-2">
            {fitOptions.map((f) => (
              <button
                key={f.value}
                type="button"
                className="chip"
                data-active={filters.fits.includes(f.value)}
                onClick={() => update({ fits: toggle(filters.fits, f.value) })}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Material (clothing only) */}
      {groups.showMaterial && (
        <Section title="Material">
          <div className="flex flex-wrap gap-2">
            {["Cotton", "Linen", "Polyester", "Fleece", "Denim", "Nylon"].map(
              (m) => (
                <button
                  key={m}
                  type="button"
                  className="chip"
                  data-active={filters.materials.includes(m)}
                  onClick={() =>
                    update({ materials: toggle(filters.materials, m) })
                  }
                >
                  {m}
                </button>
              )
            )}
          </div>
        </Section>
      )}

      {/* Toggles */}
      <Section title="Availability">
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={filters.saleOnly}
              onChange={(e) => update({ saleOnly: e.target.checked })}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            On sale only
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => update({ inStockOnly: e.target.checked })}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            In stock only
          </label>
        </div>
      </Section>
    </div>
  );
}
