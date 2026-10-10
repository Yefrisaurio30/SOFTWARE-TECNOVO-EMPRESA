import { allSpecs } from "@/lib/specs";
import type { Specs } from "@/lib/products";

export function SpecsTable({ specs }: { specs: Specs }) {
  const rows = allSpecs(specs);
  if (rows.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10">
      <table className="w-full text-left text-[15px]">
        <caption className="sr-only">Ficha técnica</caption>
        <tbody>
          {rows.map(([k, v], i) => (
            <tr key={k} className={i % 2 === 0 ? "bg-surface" : "bg-graphite"}>
              <th scope="row" className="px-5 py-3 font-normal text-text-muted">
                {k}
              </th>
              <td className="px-5 py-3 text-text">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
