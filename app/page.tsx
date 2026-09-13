import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import CategoryTiles from "@/components/home/CategoryTiles";
import ProductRow from "@/components/home/ProductRow";
import GenderBlocks from "@/components/home/GenderBlocks";
import CampaignBand from "@/components/home/CampaignBand";
import WhyPace from "@/components/home/WhyPace";
import Reviews from "@/components/home/Reviews";
import StoreSection from "@/components/home/StoreSection";
import ProductCard from "@/components/product/ProductCard";
import {
  getNewProducts,
  getProductsByType,
  getAllProducts,
} from "@/content/products";

export default function Home() {
  const newArrivals = getNewProducts();
  const footwear = getProductsByType("footwear").slice(0, 8);
  const bestSellers = [...getAllProducts()]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 8);

  return (
    <>
      <Hero />
      <Marquee />
      <CategoryTiles />
      <ProductRow
        eyebrow="Just landed"
        title="New arrivals"
        products={newArrivals}
        viewAllHref="/shop?new=true&sort=newest"
      />
      <GenderBlocks />
      <ProductRow
        eyebrow="On your feet"
        title="Footwear spotlight"
        products={footwear}
        viewAllHref="/shop/footwear"
        viewAllLabel="View all footwear"
      />
      <CampaignBand />
      <section className="mx-auto max-w-[1400px] px-4 py-16">
        <div className="mb-8">
          <p className="eyebrow">Most wanted</p>
          <h2 className="display-section mt-2">Best sellers</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <WhyPace />
      <Reviews />
      <StoreSection />
    </>
  );
}
