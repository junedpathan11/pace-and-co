import { Suspense } from "react";
import type { Metadata } from "next";
import ShopClient from "@/components/shop/ShopClient";
import { getAllProducts } from "@/content/products";

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "Shop the full Pace & Co. collection — clothing, footwear and accessories with adaptive filters for size, colour, brand and price.",
};

export default function ShopPage() {
  const products = getAllProducts();
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopClient allProducts={products} heading="Shop all" />
    </Suspense>
  );
}

function ShopFallback() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="h-8 w-40 animate-pulse rounded bg-grey" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] w-full rounded-img bg-grey" />
            <div className="mt-3 h-3 w-1/2 rounded bg-grey" />
          </div>
        ))}
      </div>
    </div>
  );
}
