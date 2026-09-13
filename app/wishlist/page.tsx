import type { Metadata } from "next";
import WishlistView from "@/components/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved Pace & Co. favourites — move them to your bag anytime.",
};

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="mb-8">
        <p className="eyebrow">Saved</p>
        <h1 className="display-section mt-2">Wishlist</h1>
      </div>
      <WishlistView />
    </div>
  );
}
