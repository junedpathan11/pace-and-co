"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/content/site";
import {
  cartStore,
  cartTotals,
  useCart,
  validateCart,
  type CartItem,
} from "@/lib/cart";
import { useMounted } from "@/lib/useMounted";
import {
  buildWhatsAppLink,
  formatINR,
  placedOrderMessage,
} from "@/lib/whatsapp";
import {
  createOrder,
  orderStore,
  PAYMENT_LABELS,
  type CustomerDetails,
  type DemoOrder,
  type PaymentMethod,
} from "@/lib/order";
import { buildOrderNotification } from "@/lib/orderNotification";
import { isWeb3FormsConfigured, submitToWeb3Forms } from "@/lib/web3forms";
import {
  INDIAN_STATES,
  REQUIRED_FIELDS,
  validateAll,
  validateField,
  type CheckoutErrors,
  type CheckoutField,
} from "@/lib/checkoutValidation";
import { SelectField, TextField } from "./Field";
import OrderSummary, { type SummaryLine } from "./OrderSummary";
import { BagIcon, LockIcon, TruckIcon, WhatsAppIcon } from "@/components/ui/icons";

const DRAFT_KEY = "paceco-checkout-draft-v1";

/** Stable empty reference — avoids a new array identity on every render. */
const EMPTY_ITEMS: CartItem[] = [];

const EMPTY_DETAILS: CustomerDetails = {
  fullName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
};

/** Restore an in-progress form so a refresh or a failed submit loses nothing. */
function loadDraft(): CustomerDetails {
  if (typeof window === "undefined") return EMPTY_DETAILS;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_DETAILS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY_DETAILS;
    const draft = parsed as Partial<Record<CheckoutField, unknown>>;
    const next = { ...EMPTY_DETAILS };
    (Object.keys(EMPTY_DETAILS) as CheckoutField[]).forEach((field) => {
      const value = draft[field];
      if (typeof value === "string") next[field] = value;
    });
    return next;
  } catch {
    return EMPTY_DETAILS;
  }
}

function toSummaryLines(items: CartItem[]): SummaryLine[] {
  return items.map((i) => ({
    key: `${i.productId}-${i.size}-${i.color}`,
    name: i.name,
    brand: i.brand,
    image: i.image,
    color: i.color,
    sizeLabel: i.sizeLabel,
    qty: i.qty,
    price: i.price,
    lineTotal: i.price * i.qty,
  }));
}

export default function CheckoutView() {
  const router = useRouter();
  const cart = useCart();
  const mounted = useMounted();

  const [details, setDetails] = useState<CustomerDetails>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<{ message: string; order: DemoOrder } | null>(
    null
  );
  const errorRef = useRef<HTMLDivElement>(null);

  // Restore any saved draft once, after mount (keeps SSR output stable).
  useEffect(() => {
    const draft = loadDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetails(draft);
  }, []);

  // Persist the draft so a refresh mid-checkout doesn't wipe the form.
  useEffect(() => {
    if (details === EMPTY_DETAILS) return;
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(details));
    } catch {
      /* storage unavailable — the form still works in-page */
    }
  }, [details]);

  // Gate the persisted cart behind `mounted` so SSR and the first client
  // render agree; memoised so the derived totals stay referentially stable.
  const items = useMemo(() => (mounted ? cart : EMPTY_ITEMS), [mounted, cart]);
  const totals = useMemo(() => cartTotals(items), [items]);
  const cartIssues = useMemo(() => validateCart(items), [items]);
  const notificationsConfigured = isWeb3FormsConfigured();

  const setField = useCallback(
    (field: CheckoutField, value: string) => {
      setDetails((prev) => ({ ...prev, [field]: value }));
      // Clear an existing error as soon as the value becomes valid.
      setErrors((prev) => {
        if (!prev[field]) return prev;
        if (validateField(field, value)) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const onBlur = useCallback((field: CheckoutField) => {
    setDetails((current) => {
      const error = validateField(field, current[field]);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) next[field] = error;
        else delete next[field];
        return next;
      });
      return current;
    });
  }, []);

  /** Returns null on success, or the reason the notification failed. */
  async function notifyStore(order: DemoOrder): Promise<string | null> {
    try {
      const result = await submitToWeb3Forms(buildOrderNotification(order));
      return result.ok ? null : result.error;
    } catch {
      return "Couldn't reach the server. Please try again.";
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const fieldErrors = validateAll(details);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      // Move focus to the first invalid control for keyboard/screen-reader users.
      const first = REQUIRED_FIELDS.find((f) => fieldErrors[f]);
      if (first) document.getElementById(first)?.focus();
      return;
    }
    if (items.length === 0 || cartIssues.length > 0) return;

    setSubmitting(true);
    setFailure(null);

    const order = createOrder({
      customer: {
        ...details,
        fullName: details.fullName.trim(),
        email: details.email.trim(),
        phone: details.phone.trim(),
        address1: details.address1.trim(),
        address2: details.address2.trim(),
        city: details.city.trim(),
        pincode: details.pincode.trim(),
      },
      items,
      totals,
      paymentMethod: payment,
    });

    // Send the store notification first: the order is only "placed" once the
    // store has actually been told about it (or notifications are switched off
    // on this deployment, which is surfaced to the customer up front).
    let notified = false;
    if (notificationsConfigured) {
      const error = await notifyStore(order);
      if (error) {
        setSubmitting(false);
        setFailure({ message: error, order });
        requestAnimationFrame(() => errorRef.current?.focus());
        return;
      }
      notified = true;
    }

    const placed: DemoOrder = { ...order, notified };
    orderStore.save(placed);
    cartStore.clear();
    try {
      window.sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    router.push(`/order-success/${placed.orderId}`);
  }

  /* ----------------------------------------------------------------------
     Guard states
     ---------------------------------------------------------------------- */

  if (!mounted) {
    return <div className="min-h-[60vh]" aria-hidden />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card bg-grey py-20 text-center">
        <BagIcon width={44} height={44} className="text-muted" />
        <h2 className="font-display mt-4 text-2xl font-extrabold uppercase">
          Nothing to check out
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Your bag is empty, so there&apos;s no order to place yet. Add a piece
          you like and come back.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-primary">
            Start shopping
          </Link>
          <Link href="/cart" className="btn btn-secondary">
            View bag
          </Link>
        </div>
      </div>
    );
  }

  const summaryLines = toSummaryLines(items);
  const whatsappFallbackHref = buildWhatsAppLink(
    placedOrderMessage({
      orderId: failure?.order.orderId ?? "—",
      customerName: details.fullName,
      lines: items.map((i) => ({
        name: i.name,
        brand: i.brand,
        variant: `${i.sizeLabel} / ${i.color}`,
        qty: i.qty,
        lineTotal: i.price * i.qty,
      })),
      total: totals.total,
      address: [
        details.address1,
        details.address2,
        `${details.city} ${details.pincode}`,
        details.state,
      ]
        .filter((p) => p && p.trim())
        .join(", "),
    })
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-[1fr_380px]">
      {/* ---------------------------------------------------------------- */}
      {/* LEFT — customer + delivery                                        */}
      {/* ---------------------------------------------------------------- */}
      <div className="min-w-0">
        {cartIssues.length > 0 && (
          <div
            role="alert"
            className="mb-8 rounded-card border border-primary/40 bg-primary/5 p-4 text-sm"
          >
            <p className="font-semibold text-primary">
              Some items need attention
            </p>
            <ul className="mt-2 space-y-1 text-muted">
              {cartIssues.map((issue) => (
                <li key={issue.key}>
                  {issue.name} {issue.reason}.
                </li>
              ))}
            </ul>
            <Link
              href="/cart"
              className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-ink hover:text-primary"
            >
              Update your bag →
            </Link>
          </div>
        )}

        {!notificationsConfigured && (
          <div className="mb-8 rounded-card border border-border bg-surface p-4 text-sm">
            <p className="font-semibold">Order notifications are off</p>
            <p className="mt-1 text-muted">
              This deployment has no{" "}
              <code className="rounded bg-grey px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_WEB3FORMS_KEY
              </code>{" "}
              configured, so the store won&apos;t be emailed. You can still place
              the demo order and view the invoice, or send it over WhatsApp.
            </p>
          </div>
        )}

        {/* Customer information */}
        <section aria-labelledby="customer-heading">
          <div className="flex items-baseline gap-3">
            <span className="font-display grid h-7 w-7 shrink-0 place-items-center rounded-chip bg-ink text-xs font-bold text-white">
              1
            </span>
            <h2 id="customer-heading" className="font-display text-xl font-extrabold uppercase">
              Customer information
            </h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField
              id="fullName"
              label="Full name"
              type="text"
              autoComplete="name"
              required
              className="sm:col-span-2"
              value={details.fullName}
              error={errors.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              onBlur={() => onBlur("fullName")}
              placeholder="Priya Sharma"
            />
            <TextField
              id="email"
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={details.email}
              error={errors.email}
              hint="Your order confirmation goes here."
              onChange={(e) => setField("email", e.target.value)}
              onBlur={() => onBlur("email")}
              placeholder="priya@example.com"
            />
            <TextField
              id="phone"
              label="Phone number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={details.phone}
              error={errors.phone}
              hint="10-digit Indian mobile number."
              onChange={(e) => setField("phone", e.target.value)}
              onBlur={() => onBlur("phone")}
              placeholder="98765 43210"
            />
          </div>
        </section>

        {/* Delivery address */}
        <section aria-labelledby="address-heading" className="mt-10">
          <div className="flex items-baseline gap-3">
            <span className="font-display grid h-7 w-7 shrink-0 place-items-center rounded-chip bg-ink text-xs font-bold text-white">
              2
            </span>
            <h2 id="address-heading" className="font-display text-xl font-extrabold uppercase">
              Delivery address
            </h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField
              id="address1"
              label="Address line 1"
              type="text"
              autoComplete="address-line1"
              required
              className="sm:col-span-2"
              value={details.address1}
              error={errors.address1}
              onChange={(e) => setField("address1", e.target.value)}
              onBlur={() => onBlur("address1")}
              placeholder="Flat / house no., building, street"
            />
            <TextField
              id="address2"
              label="Address line 2"
              optional
              type="text"
              autoComplete="address-line2"
              className="sm:col-span-2"
              value={details.address2}
              onChange={(e) => setField("address2", e.target.value)}
              placeholder="Area, landmark"
            />
            <TextField
              id="city"
              label="City"
              type="text"
              autoComplete="address-level2"
              required
              value={details.city}
              error={errors.city}
              onChange={(e) => setField("city", e.target.value)}
              onBlur={() => onBlur("city")}
              placeholder="Ahmedabad"
            />
            <SelectField
              id="state"
              label="State"
              autoComplete="address-level1"
              required
              options={INDIAN_STATES}
              placeholder="Select a state"
              value={details.state}
              error={errors.state}
              onChange={(e) => setField("state", e.target.value)}
              onBlur={() => onBlur("state")}
            />
            <TextField
              id="pincode"
              label="Pincode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              required
              value={details.pincode}
              error={errors.pincode}
              onChange={(e) =>
                setField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              onBlur={() => onBlur("pincode")}
              placeholder="380015"
            />
            <div className="flex items-end">
              <p className="text-xs text-muted">
                We deliver across India. Country: <strong className="font-medium text-ink">India</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Delivery method */}
        <section aria-labelledby="delivery-heading" className="mt-10">
          <div className="flex items-baseline gap-3">
            <span className="font-display grid h-7 w-7 shrink-0 place-items-center rounded-chip bg-ink text-xs font-bold text-white">
              3
            </span>
            <h2 id="delivery-heading" className="font-display text-xl font-extrabold uppercase">
              Delivery
            </h2>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 rounded-card border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-chip bg-grey text-ink">
                <TruckIcon width={20} height={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">Standard delivery</p>
                <p className="text-xs text-muted">
                  {site.standardDeliveryEta} across India
                </p>
              </div>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular">
              {totals.delivery === 0 ? "Free" : formatINR(totals.delivery)}
            </p>
          </div>
        </section>

        {/* Payment */}
        <section aria-labelledby="payment-heading" className="mt-10">
          <div className="flex items-baseline gap-3">
            <span className="font-display grid h-7 w-7 shrink-0 place-items-center rounded-chip bg-ink text-xs font-bold text-white">
              4
            </span>
            <h2 id="payment-heading" className="font-display text-xl font-extrabold uppercase">
              Payment method
            </h2>
          </div>

          <fieldset className="mt-5">
            <legend className="sr-only">Choose how you&apos;d like to pay</legend>
            <div className="space-y-3">
              {(
                [
                  {
                    value: "cod" as const,
                    title: PAYMENT_LABELS.cod,
                    copy: "Pay the delivery partner when your order arrives.",
                  },
                  {
                    value: "whatsapp" as const,
                    title: PAYMENT_LABELS.whatsapp,
                    copy: "We'll message you to confirm the order and arrange payment.",
                  },
                ]
              ).map((option) => {
                const selected = payment === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-card border bg-surface p-4 transition-colors ${
                      selected ? "border-ink" : "border-border hover:border-ink/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={option.value}
                      checked={selected}
                      onChange={() => setPayment(option.value)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{option.title}</span>
                      <span className="mt-0.5 block text-xs text-muted">{option.copy}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <p className="mt-4 flex items-start gap-2 text-xs text-muted">
            <LockIcon width={14} height={14} className="mt-0.5 shrink-0" />
            <span>
              {site.name} is a concept demo — there is no online payment gateway
              and no card details are ever collected or processed on this site.
            </span>
          </p>
        </section>

        {/* Submission failure — details kept, WhatsApp offered */}
        {failure && (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            className="mt-8 rounded-card border border-primary/40 bg-primary/5 p-4 text-sm outline-none"
          >
            <p className="font-semibold text-primary">Order not sent</p>
            <p className="mt-1 text-muted">{failure.message}</p>
            <p className="mt-2 text-muted">
              Your details and your bag have been kept — you can try again, or
              send the order straight to us on WhatsApp.
            </p>
            <a
              href={whatsappFallbackHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-red mt-4 w-full sm:w-auto"
            >
              <WhatsAppIcon width={18} height={18} /> Order via WhatsApp
            </a>
          </div>
        )}

        <p className="mt-8 text-xs text-muted lg:hidden">
          Need to change something?{" "}
          <Link href="/cart" className="font-semibold text-ink hover:text-primary">
            Edit your bag
          </Link>
        </p>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* RIGHT — sticky summary                                            */}
      {/* ---------------------------------------------------------------- */}
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-card bg-grey p-5 sm:p-6">
          <OrderSummary lines={summaryLines} totals={totals} />

          <button
            type="submit"
            disabled={submitting || cartIssues.length > 0}
            className="btn btn-primary mt-6 w-full"
          >
            {submitting ? "Placing order…" : `Place order · ${formatINR(totals.total)}`}
          </button>

          <div className="mt-4 flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-border" />
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <a
            href={whatsappFallbackHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary mt-4 w-full"
          >
            <WhatsAppIcon width={18} height={18} /> Order via WhatsApp
          </a>

          <p className="mt-4 text-center text-xs text-muted">
            No payment is taken on this site. We&apos;ll confirm your order
            before it ships.
          </p>

          <Link
            href="/cart"
            className="mt-4 hidden text-center text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink lg:block"
          >
            ← Back to bag
          </Link>
        </div>
      </aside>
    </form>
  );
}
