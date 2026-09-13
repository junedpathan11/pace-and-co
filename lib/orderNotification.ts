"use client";

import { site } from "@/content/site";
import { formatINR } from "@/lib/whatsapp";
import { formatOrderDate, type DemoOrder } from "@/lib/order";

/**
 * Build the Web3Forms payload for a demo order notification.
 *
 * Contains only what the store needs to fulfil the order: reference numbers,
 * contact details, the shipping address, line items and totals. No payment
 * data, no credentials, no access key (the client appends that separately).
 */
export function buildOrderNotification(
  order: DemoOrder
): Record<string, string> {
  const { customer, items, totals } = order;

  const itemLines = items
    .map(
      (i, n) =>
        `${n + 1}. ${i.name} (${i.brand}) — ${i.sizeLabel} / ${i.color} × ${
          i.qty
        } @ ${formatINR(i.price)} = ${formatINR(i.lineTotal)}`
    )
    .join("\n");

  const address = [
    customer.address1,
    customer.address2,
    `${customer.city}, ${customer.state} ${customer.pincode}`,
    "India",
  ]
    .filter((l) => l && l.trim())
    .join("\n");

  const summary = [
    `Subtotal: ${formatINR(totals.subtotal)}`,
    totals.savings > 0 ? `Discount/savings: −${formatINR(totals.savings)}` : null,
    `Delivery: ${totals.delivery === 0 ? "Free" : formatINR(totals.delivery)}`,
    `Total: ${formatINR(totals.total)}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `New demo order ${order.orderId} — ${site.name}`,
    from_name: `${site.name} website`,
    // Lets the store reply straight to the customer.
    replyto: customer.email,

    order_number: order.orderId,
    invoice_number: order.invoiceId,
    order_date: formatOrderDate(order.placedAt),

    customer_name: customer.fullName,
    customer_email: customer.email,
    customer_phone: customer.phone,

    delivery_address: address,
    address_line_1: customer.address1,
    address_line_2: customer.address2 || "—",
    city: customer.city,
    state: customer.state,
    pincode: customer.pincode,

    items: itemLines,
    item_count: String(items.reduce((n, i) => n + i.qty, 0)),

    subtotal: formatINR(totals.subtotal),
    discount: totals.savings > 0 ? `−${formatINR(totals.savings)}` : "—",
    delivery: totals.delivery === 0 ? "Free" : formatINR(totals.delivery),
    total: formatINR(totals.total),

    payment_method: order.paymentLabel,
    order_status: order.status,

    message: [
      `New order from the ${site.name} website (concept demo — no payment was processed).`,
      "",
      `Order:   ${order.orderId}`,
      `Invoice: ${order.invoiceId}`,
      `Date:    ${formatOrderDate(order.placedAt)}`,
      "",
      "CUSTOMER",
      customer.fullName,
      customer.email,
      customer.phone,
      "",
      "DELIVERY ADDRESS",
      address,
      "",
      "ITEMS",
      itemLines,
      "",
      summary,
      "",
      `Payment method: ${order.paymentLabel}`,
      `Order status: ${order.status}`,
    ].join("\n"),
  };
}
