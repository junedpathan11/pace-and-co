import type { MetadataRoute } from "next";
import { getAllProducts } from "@/content/products";

const base = "https://pace-and-co.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/shop",
    "/shop/clothing",
    "/shop/footwear",
    "/shop/accessories",
    "/offers",
    "/about",
    "/contact",
    "/cart",
    "/wishlist",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const productRoutes = getAllProducts().map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
