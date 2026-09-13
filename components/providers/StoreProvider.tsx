"use client";

import { useEffect } from "react";
import { uiStore, useUI } from "@/lib/ui";

/**
 * Global client shell: wires the "/" search shortcut and locks body scroll
 * while any overlay/drawer is open. Keeps the tree mostly server-rendered.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const ui = useUI();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        uiStore.openSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const locked = ui.cartDrawerOpen || ui.searchOpen || ui.mobileMenuOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [ui.cartDrawerOpen, ui.searchOpen, ui.mobileMenuOpen]);

  return <>{children}</>;
}
