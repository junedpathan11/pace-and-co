import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug } from "@/content/products";
import ProductDetail from "@/components/product/ProductDetail";
import Recommendations from "@/components/product/Recommendations";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { ChevronRight } from "@/components/ui/icons";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — ${product.brand}`,
    description: product.description,
    openGraph: {
      title: `${product.name} — ${product.brand}`,
      description: product.description,
      images: [{ url: product.images.main, width: 1024, height: 1280 }],
    },
  };
}

const CATEGORY_LABEL: Record<string, string> = {
  clothing: "Clothing",
  footwear: "Footwear",
  accessories: "Accessories",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const catLabel = CATEGORY_LABEL[product.category] ?? product.category;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 pb-28 lg:pb-12">
      <ProductSchema product={product} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: catLabel, url: `/shop/${product.category}` },
          { name: product.name, url: `/product/${product.slug}` },
        ]}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <li>
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
          </li>
          <ChevronRight width={12} height={12} />
          <li>
            <Link href={`/shop/${product.category}`} className="capitalize hover:text-ink">
              {catLabel}
            </Link>
          </li>
          <ChevronRight width={12} height={12} />
          <li>
            <Link
              href={`/shop/${product.category}?subcategory=${encodeURIComponent(
                product.subcategory
              )}`}
              className="capitalize hover:text-ink"
            >
              {product.subcategory}
            </Link>
          </li>
          <ChevronRight width={12} height={12} />
          <li className="truncate text-ink">{product.name}</li>
        </ol>
      </nav>

      <ProductDetail product={product} />
      <Recommendations product={product} />
    </div>
  );
}
