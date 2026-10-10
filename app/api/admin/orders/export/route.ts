import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvCell(v: string | number): string {
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    return new Response("No autorizado", { status: 401 });
  }
  const status = new URL(req.url).searchParams.get("status") || "";
  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : {},
    orderBy: { createdAt: "desc" },
    take: 1000,
    include: { items: true },
  });
  const rows = [
    ["id", "fecha", "estado", "total", "cliente", "telefono", "ciudad", "mayorista", "items"].join(","),
    ...orders.map((o) =>
      [
        csvCell(o.id),
        csvCell(o.createdAt.toISOString()),
        csvCell(o.status),
        o.total,
        csvCell(o.contactName),
        csvCell(o.contactPhone),
        csvCell(o.city),
        o.isWholesale ? "SI" : "NO",
        csvCell(o.items.map((i) => `${i.productId}x${i.qty}@${i.unitPrice}`).join(";")),
      ].join(","),
    ),
  ];
  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos${status ? `-${status}` : ""}.csv"`,
    },
  });
}
