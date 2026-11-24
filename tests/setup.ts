import { vi } from "vitest";

/** En vitest no hay contexto de caché de Next: unstable_cache solo estorba. */
vi.mock("next/cache", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, unstable_cache: (fn: unknown) => fn };
});
