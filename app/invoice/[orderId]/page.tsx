import type { Metadata } from "next";
import InvoiceView from "@/components/order/InvoiceView";

export const metadata: Metadata = {
  title: "Invoice",
  description: "Your Pace & Co. order invoice.",
  robots: { index: false, follow: false },
};

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 print:p-0">
      <InvoiceView orderId={decodeURIComponent(orderId)} />
    </div>
  );
}
