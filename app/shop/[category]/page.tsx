import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopClient from "@/components/shop/ShopClient";
import { getAllProducts } from "@/content/products";
import type { ProductType } from "@/content/types";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

const VALID: Record<string, { type: ProductType; heading: string; desc: string }> = {
  clothing: {
    type: "clothing",
    heading: "Clothing",
    desc: "Tees, shirts, hoodies, denim and more — everyday fashion staples from Pace & Co.",
  },
  footwear: {
    type: "footwear",
    heading: "Footwear",
    desc: "Sneakers, running shoes, boots and sandals engineered for the city.",
  },
  accessories: {
    type: "accessories",
    heading: "Accessories",
    desc: "Bags, caps, belts, wallets and sunglasses to finish the fit.",
  },
};

export function generateStaticParams() {
  return Object.keys(VALID).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const entry = VALID[category];
  if (!entry) return { title: "Shop" };
  return { title: entry.heading, description: entry.desc };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const entry = VALID[category];
  if (!entry) notFound();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: entry.heading, url: `/shop/${category}` },
        ]}
      />
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <ShopClient
          allProducts={getAllProducts()}
          lockedType={entry.type}
          heading={entry.heading}
        />
      </Suspense>
    </>
  );
}
