import { createHash, timingSafeEqual } from "node:crypto";

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

/** Firma de integridad. Orden obligatorio: reference + amountInCents + currency + secret. Solo servidor. */
export function buildIntegritySignature(p: {
  reference: string;
  amountInCents: number;
  currency: "COP";
  integritySecret: string;
}): string {
  return sha256(`${p.reference}${p.amountInCents}${p.currency}${p.integritySecret}`);
}

export function buildCheckoutUrl(p: {
  publicKey: string;
  reference: string;
  amountInCents: number;
  signature: string;
  redirectUrl: string;
}): string {
  const q = new URLSearchParams({
    "public-key": p.publicKey,
    currency: "COP",
    "amount-in-cents": String(p.amountInCents),
    reference: p.reference,
    "signature:integrity": p.signature,
    "redirect-url": p.redirectUrl,
  });
  return `https://checkout.wompi.co/p/?${q.toString()}`;
}

const getPath = (obj: unknown, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>((acc, k) => (acc == null ? undefined : (acc as Record<string, unknown>)[k]), obj);

export interface WompiEvent {
  event: string;
  data: unknown;
  signature?: {
    properties?: string[];
    timestamp?: number | string;
    checksum?: string;
  } | null;
}

/**
 * Verifica el checksum del webhook. Lee properties dinámicamente en el orden
 * en que vienen. Compara con timingSafeEqual. Nunca con ===.
 */
export function verifyEventChecksum(
  event: WompiEvent,
  eventsSecret: string,
  headerChecksum?: string | null,
): boolean {
  const sig = event?.signature;
  if (!sig?.properties || sig.timestamp == null || !sig.checksum) return false;
  let concatenated = "";
  try {
    concatenated =
      sig.properties.map((path) => String(getPath(event.data, path) ?? "")).join("") +
      String(sig.timestamp) +
      eventsSecret;
  } catch {
    return false;
  }
  const expected = sha256(concatenated).toLowerCase();
  const received = String(headerChecksum ?? sig.checksum).toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(expected) || !/^[0-9a-f]{64}$/.test(received)) return false;
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(received, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
