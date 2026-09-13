import type { Metadata } from "next";
import OrderSuccessView from "@/components/order/OrderSuccessView";

export const metadata: Metadata = {
  title: "Order placed",
  description: "Your Pace & Co. order confirmation.",
  // Order pages are personal and local-only — never index them.
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <OrderSuccessView orderId={decodeURIComponent(orderId)} />
    </div>
  );
}
