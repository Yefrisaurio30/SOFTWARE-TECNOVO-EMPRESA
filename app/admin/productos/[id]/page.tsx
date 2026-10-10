import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Editar: {product.name}</h1>
      <div className="mt-6">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
