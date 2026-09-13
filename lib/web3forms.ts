"use client";

/* ============================================================================
   Web3Forms client

   Shared submit + response handling for every form on the site. Success
   requires BOTH a successful HTTP response AND `success === true` in the JSON
   body — an HTTP 200 carrying `success: false` is treated as a failure so the
   UI never claims something was sent when it wasn't.

   The access key is read from NEXT_PUBLIC_WEB3FORMS_KEY at build time and is
   never logged or hardcoded.
   ========================================================================== */

const ENDPOINT = "https://api.web3forms.com/submit";

const PLACEHOLDERS = new Set([
  "YOUR_ACCESS_KEY",
  "your_web3forms_access_key_here",
]);

/** The raw key, or undefined when unset/left as the .env.example placeholder. */
export function getWeb3FormsKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  if (!key || PLACEHOLDERS.has(key)) return undefined;
  return key;
}

export function isWeb3FormsConfigured(): boolean {
  return getWeb3FormsKey() !== undefined;
}

export type Web3FormsResult =
  | { ok: true }
  | { ok: false; error: string; reason: "unconfigured" | "network" | "api" };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * POST a payload to Web3Forms. Field values are sent as-is; callers decide
 * what goes in, and must not include secrets or credentials.
 */
export async function submitToWeb3Forms(
  fields: Record<string, string>
): Promise<Web3FormsResult> {
  const key = getWeb3FormsKey();
  if (!key) {
    return {
      ok: false,
      reason: "unconfigured",
      error:
        "Order notifications aren't configured on this demo deployment (missing Web3Forms access key).",
    };
  }

  const body = new FormData();
  Object.entries(fields).forEach(([name, value]) => body.append(name, value));
  body.append("access_key", key);

  let res: Response;
  try {
    res = await fetch(ENDPOINT, { method: "POST", body });
  } catch {
    return {
      ok: false,
      reason: "network",
      error: "Couldn't reach the server. Please check your connection and try again.",
    };
  }

  const payload: unknown = await res.json().catch(() => null);
  const succeeded =
    res.ok &&
    isRecord(payload) &&
    "success" in payload &&
    payload.success === true;

  if (!succeeded) {
    const apiMessage =
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : "Something went wrong sending your order.";
    return { ok: false, reason: "api", error: apiMessage };
  }

  return { ok: true };
}
