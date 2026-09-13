"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { uiStore } from "@/lib/ui";
import { useCart, cartCount } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useMounted } from "@/lib/useMounted";
import {
  SearchIcon,
  HeartIcon,
  BagIcon,
  MenuIcon,
} from "@/components/ui/icons";
import MobileMenu from "./MobileMenu";

const NAV = [
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Men", href: "/shop?gender=men" },
  { label: "Women", href: "/shop?gender=women" },
  { label: "Kids", href: "/shop?gender=kids" },
  { label: "Clothing", href: "/shop/clothing" },
  { label: "Footwear", href: "/shop/footwear" },
  { label: "Accessories", href: "/shop/accessories" },
  { label: "Sale", href: "/offers", sale: true },
];

export default function Navbar() {
  const mounted = useMounted();
  const cart = useCart();
  const wishlist = useWishlist();
  const count = mounted ? cartCount(cart) : 0;
  const wishCount = mounted ? wishlist.length : 0;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) uiStore.openMobileMenu();
    else uiStore.closeMobileMenu();
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      {/* Announcement strip */}
      <div className="bg-ink text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-2 text-center text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
          {site.announcement}
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4">
        {/* Left: mobile menu + wordmark */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-chip hover:bg-grey lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
          <Link
            href="/"
            className="font-display text-2xl font-extrabold tracking-tight text-ink"
          >
            {site.wordmark}
          </Link>
        </div>

        {/* Center nav */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-[0.8125rem] font-medium transition-colors hover:text-primary ${
                item.sale ? "text-primary" : "text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => uiStore.openSearch()}
            aria-label="Search"
            className="grid h-11 w-11 place-items-center rounded-chip hover:bg-grey"
          >
            <SearchIcon />
          </button>
          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${wishCount} items`}
            className="relative grid h-11 w-11 place-items-center rounded-chip hover:bg-grey"
          >
            <HeartIcon />
            {wishCount > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-chip bg-primary px-1 text-[0.625rem] font-bold text-white tabular">
                {wishCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => uiStore.openCart()}
            aria-label={`Cart, ${count} items`}
            className="relative grid h-11 w-11 place-items-center rounded-chip hover:bg-grey"
          >
            <BagIcon />
            {count > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-chip bg-primary px-1 text-[0.625rem] font-bold text-white tabular">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <MobileMenu nav={NAV} onClose={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
