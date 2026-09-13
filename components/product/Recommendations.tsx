import type { Product } from "@/content/types";
import { getAllProducts } from "@/content/products";
import ProductCard from "./ProductCard";

function pick(list: Product[], count: number): Product[] {
  return list.slice(0, count);
}

export default function Recommendations({ product }: { product: Product }) {
  const all = getAllProducts().filter((p) => p.id !== product.id);

  // "Complete the look" — cross-type recommendations
  const crossType: Product[] =
    product.productType === "footwear"
      ? pick(
          all.filter((p) => p.productType === "clothing" && p.gender === product.gender),
          4
        )
      : product.productType === "clothing"
        ? pick(
            all.filter(
              (p) => p.productType === "footwear" && (p.gender === product.gender || p.gender === "unisex")
            ),
            4
          )
        : pick(all.filter((p) => p.productType === "clothing"), 4);

  const completeLook = crossType.length >= 4 ? crossType : pick(all.filter((p) => p.productType !== product.productType), 4);

  // "You may also like" — same subcategory / category
  const alike = pick(
    all.filter(
      (p) =>
        p.subcategory === product.subcategory ||
        (p.productType === product.productType && p.category === product.category)
    ),
    4
  );
  const alsoLike = alike.length >= 4 ? alike : pick(all.filter((p) => p.productType === product.productType), 4);

  return (
    <div className="mt-20 space-y-16">
      <section>
        <div className="mb-6">
          <p className="eyebrow">Style it with</p>
          <h2 className="display-section mt-2">Complete the look</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {completeLook.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <p className="eyebrow">More like this</p>
          <h2 className="display-section mt-2">You may also like</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {alsoLike.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
