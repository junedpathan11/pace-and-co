import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your bag",
  description:
    "Review your Pace & Co. bag, then check out or continue your order on WhatsApp.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="mb-8">
        <p className="eyebrow">Your order</p>
        <h1 className="display-section mt-2">Your bag</h1>
      </div>
      <CartView />
    </div>
  );
}
