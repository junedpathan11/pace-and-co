import { site } from "@/content/site";
import type { Product } from "@/content/types";

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LocalBusinessSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: site.name,
    description: site.description,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shop 4-5, Iscon Emporio, SG Highway",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      postalCode: "380015",
      addressCountry: "IN",
    },
    openingHours: "Mo-Su 10:30-21:30",
    priceRange: "₹₹",
  };
  return <JsonLd data={data} />;
}

export function ProductSchema({ product }: { product: Product }) {
  const availability =
    product.stock === "out"
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.images.main, product.images.alt].filter(Boolean),
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability,
    },
  };
  return <JsonLd data={data} />;
}

export function BreadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `https://pace-and-co.vercel.app${item.url}`,
    })),
  };
  return <JsonLd data={data} />;
}
