import { allSpecs } from "@/lib/specs";
import type { Specs } from "@/lib/products";

export function SpecsTable({ specs, admin = false }: { specs: Specs; admin?: boolean }) {
  const rows = allSpecs(specs, admin);
  if (rows.length === 0) return null;
  return (
    <dl className="flex flex-col text-[15px]">
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="flex items-baseline justify-between gap-3 border-b border-dotted border-black/20 py-2.5"
        >
          <dt className="shrink-0 text-text-muted">{k}</dt>
          <dd className="text-right font-medium text-text">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
