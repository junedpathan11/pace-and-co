"use client";

import { useMemo, useState, useEffect } from "react";
import type { Product } from "@/content/types";
import { discountPercent, formatSizeLabel, getVariant } from "@/content/products";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { ProductBadge } from "@/components/ui/Badge";
import { HeartIcon, CheckIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";
import { WhatsAppIcon } from "@/components/ui/icons";
import Gallery from "./Gallery";
import SizeGuideModal from "./SizeGuideModal";
import { cartStore } from "@/lib/cart";
import { wishlistStore, useWishlist } from "@/lib/wishlist";
import { useMounted } from "@/lib/useMounted";
import { uiStore } from "@/lib/ui";
import { recentStore } from "@/lib/recentlyViewed";
import { buildWhatsAppLink, productOrderMessage, formatINR } from "@/lib/whatsapp";

export default function ProductDetail({ product }: { product: Product }) {
  const mounted = useMounted();
  const wishlist = useWishlist();
  const wished = mounted && wishlist.some((w) => w.productId === product.id);

  const colors = product.colors;
  const sizes = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.size))),
    [product]
  );
  const needsSize = !!product.sizeType && !(sizes.length === 1 && sizes[0] === "One Size");

  const [color, setColor] = useState(colors[0]?.name ?? "");
  const [size, setSize] = useState<string>(
    needsSize ? "" : sizes[0] ?? "One Size"
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState("");
  const [heartPop, setHeartPop] = useState(false);

  useEffect(() => {
    recentStore.push(product.slug);
  }, [product.slug]);

  const discount = discountPercent(product);
  const images = [product.images.main, product.images.alt].filter(
    Boolean
  ) as string[];

  const selectedVariant =
    size && color ? getVariant(product, size, color) : undefined;
  const selectedStock = selectedVariant?.stock;

  function isSizeAvailable(s: string): boolean {
    const v = getVariant(product, s, color);
    return !!v && v.stock !== "out";
  }

  function handleAdd() {
    if (needsSize && !size) {
      setError("Please select a size.");
      return;
    }
    if (selectedStock === "out") {
      setError("That combination is out of stock.");
      return;
    }
    setError("");
    cartStore.add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.images.main,
      size: size || "One Size",
      color,
      sizeLabel: formatSizeLabel(product, size || "One Size"),
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      qty,
    });
    setAdded(true);
    uiStore.openCart();
    setTimeout(() => setAdded(false), 1600);
  }

  function toggleWish() {
    setHeartPop(true);
    wishlistStore.toggle({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.images.main,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      size: size || undefined,
      color,
    });
    setTimeout(() => setHeartPop(false), 260);
  }

  const waMessage = productOrderMessage({
    name: product.name,
    brand: product.brand,
    sizeLabel: formatSizeLabel(product, needsSize ? size : size || "One Size"),
    color,
    qty,
    price: product.price * qty,
  });

  const specRows = product.clothingExtras
    ? [
        ["Material", product.clothingExtras.material],
        ["Fit", product.clothingExtras.fit],
        ["Care", product.clothingExtras.care],
      ]
    : product.footwearExtras
      ? [
          ["Upper", product.footwearExtras.upper],
          ["Sole", product.footwearExtras.sole],
          ["Closure", product.footwearExtras.closure],
          ["Best for", product.footwearExtras.use],
        ]
      : product.accessoryExtras
        ? [
            ["Material", product.accessoryExtras.material],
            ["Dimensions", product.accessoryExtras.dimensions],
            ["Details", product.accessoryExtras.details],
          ]
        : [];

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Gallery images={images} alt={product.name} />
        </div>

        {/* Buy box */}
        <div>
          <div className="flex items-center gap-2">
            <ProductBadge badge={product.badge} />
            {discount && (
              <span className="rounded-chip bg-ink px-2 py-1 text-[0.625rem] font-bold uppercase tracking-wider text-white">
                -{discount}% off
              </span>
            )}
          </div>

          <p className="eyebrow mt-3">{product.brand}</p>
          <h1 className="font-display mt-1 text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <Rating rating={product.rating} reviewCount={product.reviewCount} />
          </div>

          <div className="mt-4">
            <Price
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="lg"
            />
            {discount && (
              <p className="mt-1 text-sm text-primary">
                You save {formatINR((product.compareAtPrice ?? 0) - product.price)}
              </p>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted">
            {product.description}
          </p>

          {/* Colors */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="eyebrow">Colour: {color}</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={color === c.name}
                  onClick={() => {
                    setColor(c.name);
                    setError("");
                    // if current size unavailable in new colour, clear it
                    if (size && getVariant(product, size, c.name)?.stock === "out") {
                      setSize("");
                    }
                  }}
                  className={`h-10 w-10 rounded-chip border-2 transition-transform ${
                    color === c.name
                      ? "border-ink scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          {needsSize && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="eyebrow">
                  {product.sizeType === "shoe" ? "Size (UK)" : "Size"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
                >
                  Size guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const available = isSizeAvailable(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!available}
                      aria-pressed={size === s}
                      className="chip min-w-[3rem] justify-center"
                      data-active={size === s}
                      onClick={() => {
                        setSize(s);
                        setError("");
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock status */}
          {selectedVariant && selectedStock === "low" && (
            <p className="mt-4 text-sm font-medium text-primary">
              Only a few left in {size ? formatSizeLabel(product, size) : ""} · {color}
            </p>
          )}
          {selectedVariant && selectedStock === "out" && (
            <p className="mt-4 text-sm font-medium text-muted">
              This combination is sold out — try another colour or size.
            </p>
          )}

          {/* Quantity */}
          <div className="mt-6 flex items-center gap-4">
            <span className="eyebrow">Qty</span>
            <div className="flex items-center rounded-chip border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center hover:text-primary"
              >
                <MinusIcon width={16} height={16} />
              </button>
              <span className="w-10 text-center text-sm tabular">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(9, q + 1))}
                className="grid h-11 w-11 place-items-center hover:text-primary"
              >
                <PlusIcon width={16} height={16} />
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm font-medium text-primary" role="alert">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAdd}
              disabled={product.stock === "out"}
              className="btn btn-primary flex-1"
            >
              {added ? (
                <>
                  <CheckIcon width={16} height={16} /> Added
                </>
              ) : product.stock === "out" ? (
                "Sold out"
              ) : (
                "Add to Cart"
              )}
            </button>
            <button
              type="button"
              onClick={toggleWish}
              aria-pressed={wished}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              className="btn btn-secondary sm:w-auto"
            >
              <span className={heartPop ? "heart-pop" : ""}>
                <HeartIcon
                  width={18}
                  height={18}
                  filled={wished}
                  className={wished ? "text-primary" : ""}
                />
              </span>
              <span className="sm:hidden">
                {wished ? "Wishlisted" : "Wishlist"}
              </span>
            </button>
          </div>
          <a
            href={buildWhatsAppLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-red mt-3 w-full"
            onClick={(e) => {
              if (needsSize && !size) {
                e.preventDefault();
                setError("Please select a size before ordering on WhatsApp.");
              }
            }}
          >
            <WhatsAppIcon width={18} height={18} /> Send Order on WhatsApp
          </a>
          <p className="mt-2 text-center text-xs text-muted">
            We&apos;ll confirm availability and delivery on WhatsApp — nothing is
            charged here.
          </p>

          {/* Specs */}
          {specRows.length > 0 && (
            <div className="mt-8">
              <h2 className="eyebrow mb-3">Details</h2>
              <dl className="divide-y divide-border rounded-card border border-border">
                {specRows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-sm text-muted">{k}</dt>
                    <dd className="text-right text-sm font-medium capitalize">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Features */}
          <ul className="mt-6 space-y-2">
            {product.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckIcon
                  width={16}
                  height={16}
                  className="mt-0.5 shrink-0 text-primary"
                />
                {f}
              </li>
            ))}
          </ul>

          {/* Delivery accordion */}
          <DeliveryAccordion />
        </div>
      </div>

      {showGuide && <SizeGuideModal onClose={() => setShowGuide(false)} />}

      {/* Sticky mobile bar */}
      <StickyBar
        price={product.price}
        compareAtPrice={product.compareAtPrice}
        onAdd={handleAdd}
        soldOut={product.stock === "out"}
      />
    </>
  );
}

function DeliveryAccordion() {
  const items = [
    {
      q: "Delivery",
      a: "Free delivery on orders above ₹2,999. Standard delivery is 3–6 business days across India. Store pickup available in Ahmedabad.",
    },
    {
      q: "Returns & exchange",
      a: "7-day returns on unworn items with tags. Free size exchange in store or by post — just message us on WhatsApp to arrange it.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-8 divide-y divide-border border-y border-border">
      {items.map((it, i) => (
        <div key={it.q}>
          <button
            type="button"
            className="flex w-full items-center justify-between py-4 text-left"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-sm font-semibold uppercase tracking-wide">
              {it.q}
            </span>
            <span className="text-primary text-xl leading-none">
              {open === i ? "−" : "+"}
            </span>
          </button>
          {open === i && (
            <p className="pb-4 text-sm text-muted">{it.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function StickyBar({
  price,
  compareAtPrice,
  onAdd,
  soldOut,
}: {
  price: number;
  compareAtPrice?: number;
  onAdd: () => void;
  soldOut: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface p-3 shadow-[var(--shadow-lift)] lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Price price={price} compareAtPrice={compareAtPrice} />
        <button
          type="button"
          onClick={onAdd}
          disabled={soldOut}
          className="btn btn-primary flex-1 max-w-[60%]"
        >
          {soldOut ? "Sold out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
