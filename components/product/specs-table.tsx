import { allSpecs } from "@/lib/specs";
import { INTERMEDIARY_PHONE } from "@/lib/intermediary";
import type { Specs } from "@/lib/products";

export function SpecsTable({
  specs,
  admin = false,
  isUsed = false,
}: {
  specs: Specs;
  admin?: boolean;
  isUsed?: boolean;
}) {
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
          <dd className="text-right font-medium text-text">
            {isUsed && k === "telefono" ? INTERMEDIARY_PHONE : v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
