"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { uiStore } from "@/lib/ui";
import { useCart, cartCount } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useMounted } from "@/lib/useMounted";
import { SearchIcon, HeartIcon, BagIcon, MenuIcon } from "@/components/ui/icons";
import MobileMenu from "./MobileMenu";

export type NavKey = "home" | "new" | "men" | "women" | "kids" | "clothing" | "footwear" | "accessories" | "sale";
export interface NavItem { label: string; href: string; key: NavKey; sale?: boolean }

const NAV: NavItem[] = [
  { label: "Home", href: "/", key: "home" },
  { label: "New Arrivals", href: "/shop?new=true&sort=newest", key: "new" },
  { label: "Men", href: "/shop?gender=men", key: "men" },
  { label: "Women", href: "/shop?gender=women", key: "women" },
  { label: "Kids", href: "/shop?gender=kids", key: "kids" },
  { label: "Clothing", href: "/shop/clothing", key: "clothing" },
  { label: "Footwear", href: "/shop/footwear", key: "footwear" },
  { label: "Accessories", href: "/shop/accessories", key: "accessories" },
  { label: "Sale", href: "/offers", key: "sale", sale: true },
];

function currentSection(pathname: string, params: URLSearchParams): NavKey | undefined {
  if (pathname === "/") return "home";
  if (pathname === "/offers") return "sale";
  if (!pathname.startsWith("/shop")) return undefined;

  // Gender is the primary context for combined URLs such as
  // ?gender=women&category=footwear, avoiding competing active links.
  const gender = params.get("gender");
  if (gender === "men" || gender === "women" || gender === "kids") return gender;
  if (params.get("new") === "true") return "new";

  const routeCategory = pathname.split("/")[2];
  const queryCategory = params.get("category") ?? params.get("productType");
  const category = routeCategory || queryCategory;
  if (category === "clothing" || category === "footwear" || category === "accessories") return category;
  return undefined;
}

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = currentSection(pathname, new URLSearchParams(searchParams.toString()));
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
      <div className="bg-ink text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-2 text-center text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
          {site.announcement}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <button type="button" className="grid h-11 w-11 place-items-center rounded-chip hover:bg-grey lg:hidden" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)}>
            <MenuIcon />
          </button>
          <Link href="/" aria-current={active === "home" ? "page" : undefined} className="font-display text-2xl font-extrabold tracking-tight text-ink">
            {site.wordmark}
          </Link>
        </div>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const isActive = item.key === active;
            return (
              <Link key={item.key} href={item.href} aria-current={isActive ? "page" : undefined} className={`relative py-2 text-[0.8125rem] transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:transition-transform ${isActive ? "font-bold text-ink after:scale-x-100" : item.sale ? "font-medium text-primary after:scale-x-0" : "font-medium text-ink hover:text-primary after:scale-x-0"}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <button type="button" onClick={() => uiStore.openSearch()} aria-label="Search" className="grid h-11 w-11 place-items-center rounded-chip hover:bg-grey"><SearchIcon /></button>
          <Link href="/wishlist" aria-label={`Wishlist, ${wishCount} items`} className="relative grid h-11 w-11 place-items-center rounded-chip hover:bg-grey">
            <HeartIcon />
            {wishCount > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-chip bg-primary px-1 text-[0.625rem] font-bold text-white tabular">{wishCount}</span>}
          </Link>
          <button type="button" onClick={() => uiStore.openCart()} aria-label={`Cart, ${count} items`} className="relative grid h-11 w-11 place-items-center rounded-chip hover:bg-grey">
            <BagIcon />
            {count > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-chip bg-primary px-1 text-[0.625rem] font-bold text-white tabular">{count}</span>}
          </button>
        </div>
      </div>

      {menuOpen && <MobileMenu nav={NAV} active={active} onClose={() => setMenuOpen(false)} />}
    </header>
  );
}
