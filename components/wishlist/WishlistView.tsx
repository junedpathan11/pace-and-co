"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useWishlist, wishlistStore, type WishlistItem } from "@/lib/wishlist";
import { cartStore } from "@/lib/cart";
import { getProductById } from "@/content/lookup";
import { formatSizeLabel } from "@/content/products";
import { useMounted } from "@/lib/useMounted";
import { Price } from "@/components/ui/Price";
import { uiStore } from "@/lib/ui";
import { TrashIcon, HeartIcon, CheckIcon } from "@/components/ui/icons";

export default function WishlistView() {
  const wishlist = useWishlist();
  const mounted = useMounted();

  if (!mounted) return <div className="min-h-[50vh]" aria-hidden />;

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card bg-grey py-20 text-center">
        <HeartIcon width={44} height={44} className="text-muted" />
        <h2 className="font-display mt-4 text-2xl font-extrabold uppercase">
          No favourites yet
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Tap the heart on any product to save it here for later.
        </p>
        <Link href="/shop" className="btn btn-primary mt-6">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {wishlist.map((item) => (
        <WishlistCard key={item.productId} item={item} />
      ))}
    </div>
  );
}

function WishlistCard({ item }: { item: WishlistItem }) {
  const product = getProductById(item.productId);
  const sizes = product
    ? Array.from(new Set(product.variants.map((v) => v.size)))
    : [];
  const colors = product ? product.colors.map((c) => c.name) : [];
  const needsSize =
    !!product?.sizeType && !(sizes.length === 1 && sizes[0] === "One Size");

  const [size, setSize] = useState(needsSize ? "" : sizes[0] ?? "One Size");
  const [color, setColor] = useState(colors[0] ?? item.color ?? "");
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const sizeLabel = (s: string) =>
    product ? formatSizeLabel(product, s) : "One Size";

  function moveToCart() {
    if (!product) return;
    if (needsSize && !size) {
      setError("Pick a size first.");
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
      sizeLabel: sizeLabel(size || "One Size"),
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      qty: 1,
    });
    setAdded(true);
    uiStore.openCart();
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-surface shadow-[var(--shadow-card)]">
      <div className="relative">
        <Link
          href={`/product/${item.slug}`}
          className="relative block aspect-[4/5] w-full overflow-hidden bg-grey"
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
          />
        </Link>
        <button
          type="button"
          onClick={() => wishlistStore.remove(item.productId)}
          aria-label={`Remove ${item.name} from wishlist`}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-chip bg-surface/90 text-ink shadow-[var(--shadow-card)] hover:text-primary"
        >
          <TrashIcon width={16} height={16} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow">{item.brand}</p>
        <Link
          href={`/product/${item.slug}`}
          className="text-sm font-medium hover:text-primary"
        >
          {item.name}
        </Link>
        <div className="mt-1">
          <Price price={item.price} compareAtPrice={item.compareAtPrice} size="sm" />
        </div>

        {product && (colors.length > 1 || needsSize) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.length > 1 && (
              <select
                aria-label="Colour"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="rounded-chip border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-ink"
              >
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
            {needsSize && (
              <select
                aria-label="Size"
                value={size}
                onChange={(e) => {
                  setSize(e.target.value);
                  setError("");
                }}
                className="rounded-chip border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-ink"
              >
                <option value="">Size</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {sizeLabel(s)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs font-medium text-primary" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={moveToCart}
          className="btn btn-primary mt-3 w-full"
        >
          {added ? (
            <>
              <CheckIcon width={16} height={16} /> Added
            </>
          ) : (
            "Move to Cart"
          )}
        </button>
      </div>
    </div>
  );
}
