"use client";

import Image from "next/image";
import Link from "next/link";
import { uiStore, useUI } from "@/lib/ui";
import { useCart, cartStore, cartCount, cartSubtotal } from "@/lib/cart";
import { useMounted } from "@/lib/useMounted";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { formatINR } from "@/lib/whatsapp";
import { CloseIcon, TrashIcon, BagIcon } from "@/components/ui/icons";

export default function CartDrawer() {
  const ui = useUI();
  const cart = useCart();
  const mounted = useMounted();
  const open = ui.cartDrawerOpen;
  const trapRef = useFocusTrap(open, () => uiStore.closeCart());

  const items = mounted ? cart : [];
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-[var(--anim-base)] ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => uiStore.closeCart()}
      />

      {/* Panel */}
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-[var(--shadow-lift)] transition-transform duration-[var(--anim-base)] ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight">
            Your Bag ({count})
          </h2>
          <button
            type="button"
            onClick={() => uiStore.closeCart()}
            aria-label="Close cart"
            className="grid h-10 w-10 place-items-center rounded-chip hover:bg-grey"
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <BagIcon width={40} height={40} className="text-muted" />
            <p className="text-sm text-muted">Your bag is empty.</p>
            <Link
              href="/shop"
              onClick={() => uiStore.closeCart()}
              className="btn btn-primary"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-3 py-4"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={() => uiStore.closeCart()}
                    className="relative h-20 w-16 shrink-0 overflow-hidden rounded-img bg-grey"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow">{item.brand}</p>
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.sizeLabel} · {item.color}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-chip border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="grid h-8 w-8 place-items-center text-lg hover:text-primary"
                          onClick={() =>
                            cartStore.updateQty(
                              item.productId,
                              item.size,
                              item.color,
                              item.qty - 1
                            )
                          }
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm tabular">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="grid h-8 w-8 place-items-center text-lg hover:text-primary"
                          onClick={() =>
                            cartStore.updateQty(
                              item.productId,
                              item.size,
                              item.color,
                              item.qty + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold tabular">
                        {formatINR(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() =>
                      cartStore.remove(item.productId, item.size, item.color)
                    }
                    className="grid h-8 w-8 shrink-0 place-items-center self-start rounded-chip text-muted hover:bg-grey hover:text-primary"
                  >
                    <TrashIcon width={16} height={16} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-lg font-semibold tabular">
                  {formatINR(subtotal)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={() => uiStore.closeCart()}
                  className="btn btn-secondary w-full"
                >
                  View Bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => uiStore.closeCart()}
                  className="btn btn-primary w-full"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
