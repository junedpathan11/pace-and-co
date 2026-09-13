import type { CustomerDetails } from "@/lib/order";

/* ============================================================================
   Checkout field validation — Indian ecommerce defaults, deliberately simple.
   Shared by the form (per-field, on blur + on submit) and the submit handler.
   ========================================================================== */

export type CheckoutField = keyof CustomerDetails;

export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

/** Fields that must be filled before an order can be placed. */
export const REQUIRED_FIELDS: CheckoutField[] = [
  "fullName",
  "email",
  "phone",
  "address1",
  "city",
  "state",
  "pincode",
];

/** Pragmatic email shape check — the real test is whether delivery succeeds. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Indian mobile: 10 digits starting 6–9, optional +91 / 0 prefix. */
const PHONE_RE = /^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/;

/** Indian PIN code: 6 digits, cannot start with 0. */
const PINCODE_RE = /^[1-9]\d{5}$/;

/** Strip spaces/dashes so "+91 98765 43210" validates like "9876543210". */
export function normalisePhone(value: string): string {
  return value.replace(/[\s-()]/g, "");
}

export function validateField(
  field: CheckoutField,
  raw: string
): string | undefined {
  const value = raw.trim();

  if (REQUIRED_FIELDS.includes(field) && !value) {
    const labels: Record<CheckoutField, string> = {
      fullName: "Please enter your full name.",
      email: "Please enter your email address.",
      phone: "Please enter your phone number.",
      address1: "Please enter your address.",
      address2: "",
      city: "Please enter your city.",
      state: "Please select your state.",
      pincode: "Please enter your pincode.",
    };
    return labels[field];
  }

  switch (field) {
    case "fullName":
      if (value.length < 2) return "Please enter your full name.";
      return undefined;
    case "email":
      if (!EMAIL_RE.test(value)) return "Enter a valid email address.";
      return undefined;
    case "phone":
      if (!PHONE_RE.test(normalisePhone(value)))
        return "Enter a valid 10-digit Indian mobile number.";
      return undefined;
    case "address1":
      if (value.length < 5) return "Enter your house/flat and street.";
      return undefined;
    case "city":
      if (value.length < 2) return "Enter a valid city.";
      return undefined;
    case "pincode":
      if (!PINCODE_RE.test(value)) return "Enter a valid 6-digit pincode.";
      return undefined;
    default:
      return undefined;
  }
}

export function validateAll(values: CustomerDetails): CheckoutErrors {
  const errors: CheckoutErrors = {};
  (Object.keys(values) as CheckoutField[]).forEach((field) => {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  });
  return errors;
}

/** States + union territories, for the delivery address dropdown. */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;
