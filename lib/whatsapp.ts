import { site } from "@/content/site";

/**
 * Build a wa.me deep link with an encoded prefilled message.
 * Every WhatsApp touchpoint in the app funnels through this function so the
 * number and encoding stay consistent.
 */
export function buildWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${site.whatsapp.number}?text=${encoded}`;
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export interface ProductOrderInput {
  name: string;
  brand: string;
  sizeLabel: string;
  color: string;
  qty: number;
  price: number;
}

/** Single product enquiry from a product page. */
export function productOrderMessage(input: ProductOrderInput): string {
  const { name, brand, sizeLabel, color, qty, price } = input;
  return `Hi ${site.name}, I want to order: ${name} (${brand}) — ${sizeLabel}, Color ${color}, Qty ${qty} — ${formatINR(
    price
  )}`;
}

export interface CartLineInput {
  name: string;
  brand: string;
  variant: string;
  qty: number;
  lineTotal: number;
}

export interface CartOrderInput {
  customerName?: string;
  lines: CartLineInput[];
  total: number;
  deliveryNote?: string;
}

/** Multi-line cart order message. Never claims the order is confirmed. */
export function cartOrderMessage(input: CartOrderInput): string {
  const { customerName, lines, total, deliveryNote } = input;
  const parts: string[] = [];
  parts.push(`Hi ${site.name}, I'd like to place an order.`);
  if (customerName && customerName.trim()) {
    parts.push(`Name: ${customerName.trim()}`);
  }
  parts.push("");
  lines.forEach((l) => {
    parts.push(
      `• ${l.name} — ${l.brand} — ${l.variant} × ${l.qty} — ${formatINR(
        l.lineTotal
      )}`
    );
  });
  parts.push("");
  parts.push(`Total: ${formatINR(total)}`);
  if (deliveryNote && deliveryNote.trim()) {
    parts.push(`Delivery note: ${deliveryNote.trim()}`);
  }
  return parts.join("\n");
}

/** Generic question link used by the floating action button. */
export function questionMessage(): string {
  return `Hi ${site.name}, I have a question.`;
}

export interface OrderMessageInput {
  orderId: string;
  customerName: string;
  lines: CartLineInput[];
  total: number;
  address?: string;
}

/**
 * WhatsApp fallback for a placed demo order — used when the Web3Forms
 * notification fails, and encoded into the invoice QR. Carries the order
 * reference so the store can match the message to the invoice.
 */
export function placedOrderMessage(input: OrderMessageInput): string {
  const { orderId, customerName, lines, total, address } = input;
  const parts: string[] = [];
  parts.push(`Hi ${site.name}, I've placed an order on your website.`);
  parts.push(`Order: ${orderId}`);
  if (customerName.trim()) parts.push(`Name: ${customerName.trim()}`);
  parts.push("");
  lines.forEach((l) => {
    parts.push(
      `• ${l.name} — ${l.brand} — ${l.variant} × ${l.qty} — ${formatINR(
        l.lineTotal
      )}`
    );
  });
  parts.push("");
  parts.push(`Total: ${formatINR(total)}`);
  if (address && address.trim()) parts.push(`Deliver to: ${address.trim()}`);
  parts.push("");
  parts.push("Please confirm my order.");
  return parts.join("\n");
}
