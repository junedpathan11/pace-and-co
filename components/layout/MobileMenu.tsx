"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { CloseIcon } from "@/components/ui/icons";

interface NavItem {
  label: string;
  href: string;
  sale?: boolean;
}

export default function MobileMenu({
  nav,
  onClose,
}: {
  nav: NavItem[];
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-surface lg:hidden animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <Link
          href="/"
          onClick={onClose}
          className="font-display text-2xl font-extrabold text-ink"
        >
          {site.wordmark}
        </Link>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid h-11 w-11 place-items-center rounded-chip hover:bg-grey"
        >
          <CloseIcon />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6" aria-label="Mobile">
        {nav.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className={`font-display py-3 text-3xl font-extrabold uppercase tracking-tight transition-colors ${
              item.sale ? "text-primary" : "text-ink hover:text-primary"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border px-4 py-5 text-sm text-muted">
        <a href={site.phoneHref} className="block py-1 hover:text-ink">
          {site.phone}
        </a>
        <p className="py-1">{site.addressShort}</p>
        <p className="py-1">{site.hours}</p>
      </div>
    </div>
  );
}
