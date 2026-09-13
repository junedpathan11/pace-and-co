"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/content/types";
import { discountPercent } from "@/content/products";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { ProductBadge, StockPill } from "@/components/ui/Badge";
import { HeartIcon } from "@/components/ui/icons";
import { useWishlist, wishlistStore } from "@/lib/wishlist";
import { useMounted } from "@/lib/useMounted";

export default function ProductCard({
  product,
  priority = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px",
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
}) {
  const [hover, setHover] = useState(false);
  const [pop, setPop] = useState(false);
  const mounted = useMounted();
  const wishlist = useWishlist();
  const wished = mounted && wishlist.some((w) => w.productId === product.id);
  const discount = discountPercent(product);
  const soldOut = product.stock === "out";

  function toggleWish(e: React.MouseEvent) {
    e.preventDefault();
    setPop(true);
    wishlistStore.toggle({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.images.main,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
    });
    setTimeout(() => setPop(false), 260);
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative overflow-hidden rounded-img bg-grey transition-transform duration-[var(--anim-base)] ease-out group-hover:-translate-y-1">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={product.images.main}
            alt={product.name}
            fill
            sizes={sizes}
            priority={priority}
            className={`object-cover transition-opacity duration-[var(--anim-base)] ease-out ${
              hover && product.images.alt ? "opacity-0" : "opacity-100"
            }`}
          />
          {product.images.alt && (
            <Image
              src={product.images.alt}
              alt={`${product.name} alternate view`}
              fill
              sizes={sizes}
              className={`object-cover transition-opacity duration-[var(--anim-base)] ease-out ${
                hover ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <ProductBadge badge={product.badge} />
          {discount && (
            <span className="rounded-chip bg-ink px-2 py-1 text-[0.625rem] font-bold uppercase tracking-wider text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist heart */}
        <button
          type="button"
          onClick={toggleWish}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-chip bg-surface/90 text-ink shadow-[var(--shadow-card)] backdrop-blur transition-colors duration-[var(--anim-fast)] hover:text-primary"
        >
          <span className={pop ? "heart-pop" : ""}>
            <HeartIcon
              width={18}
              height={18}
              filled={wished}
              className={wished ? "text-primary" : ""}
            />
          </span>
        </button>

        {soldOut && (
          <div className="absolute bottom-3 left-3">
            <StockPill stock="out" />
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <p className="eyebrow">{product.brand}</p>
        <h3 className="text-sm font-medium leading-snug text-ink transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
          {product.stock === "low" && !soldOut && <StockPill stock="low" />}
        </div>
        <Rating rating={product.rating} reviewCount={product.reviewCount} />
      </div>
    </Link>
  );
}
