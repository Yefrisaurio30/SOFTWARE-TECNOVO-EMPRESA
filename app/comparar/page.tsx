import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSpecs } from "@/lib/products";
import { allSpecs } from "@/lib/specs";
import { formatCOP } from "@/lib/money";
import { Container, SectionHeading } from "@/components/ui/section";
import { ProductImage } from "@/components/product/product-image";
import { detailHref } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "Comparar motos | TECNOVO",
  description: "Compara hasta 3 motos lado a lado: autonomía, potencia, precio y más.",
};

export default async function CompararPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const param = Array.isArray(raw.ids) ? raw.ids[0] : raw.ids;
  const ids = [...new Set((param ?? "").split(",").filter(Boolean))].slice(0, 3);

  const products =
    ids.length >= 2
      ? await prisma.product.findMany({
          where: { id: { in: ids }, active: true, type: { in: ["MOTO_NUEVA", "MOTO_USADA"] } },
        })
      : [];
  const ordered = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p) => p != null);

  if (ordered.length < 2) {
    return (
      <main className="bg-black py-16 text-text">
        <Container className="max-w-lg text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Elige 2 o 3 motos</h1>
          <p className="mt-3 text-text-muted">
            Marca el ícono de comparar en las tarjetas del catálogo y vuelve aquí.
          </p>
          <Link href="/motos-electricas" className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-black">
            Ir al catálogo
          </Link>
        </Container>
      </main>
    );
  }

  const labels = [...new Set(ordered.flatMap((p) => allSpecs(getSpecs(p)).map(([k]) => k)))];

  return (
    <main className="bg-black py-10 text-text md:py-14">
      <Container>
        <SectionHeading eyebrow="Comparador" title="Lado a lado." />
        <div className="mt-8 overflow-x-auto rounded-[28px] border border-white/10">
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="w-40 px-5 py-4 font-medium text-text-faint">Modelo</th>
                {ordered.map((p) => (
                  <th key={p.id} scope="col" className="px-5 py-4">
                    <ProductImage images={p.images} name={p.name} type={p.type} className="aspect-[16/9] w-full rounded-2xl" />
                    <Link href={detailHref(p)} className="mt-2 block font-semibold hover:underline">
                      {p.name}
                    </Link>
                    <p className="text-sm font-normal text-text-muted tabular-nums">{formatCOP(p.priceRetail)}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labels.map((label, i) => (
                <tr key={label} className={i % 2 === 0 ? "bg-surface" : ""}>
                  <th scope="row" className="px-5 py-3 font-normal text-text-muted">{label}</th>
                  {ordered.map((p) => {
                    const row = allSpecs(getSpecs(p)).find(([k]) => k === label);
                    return <td key={p.id} className="px-5 py-3">{row ? row[1] : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </main>
  );
}
