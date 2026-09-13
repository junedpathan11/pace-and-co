import type { Metadata } from "next";
import Link from "next/link";
import CheckoutView from "@/components/checkout/CheckoutView";
import { ChevronRight } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your Pace & Co. order — enter your delivery details and place your order.",
  // Checkout is a personal, transient step: keep it out of search results.
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <li>
            <Link href="/cart" className="hover:text-ink">
              Bag
            </Link>
          </li>
          <ChevronRight width={12} height={12} />
          <li aria-current="page" className="font-medium text-ink">
            Checkout
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <p className="eyebrow">Almost there</p>
        <h1 className="display-section mt-2">Checkout</h1>
      </div>

      <CheckoutView />
    </div>
  );
}
