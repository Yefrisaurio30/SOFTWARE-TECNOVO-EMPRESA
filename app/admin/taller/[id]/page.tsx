import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "@/components/admin/service-form";

export default async function EditarServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Editar: {service.name}</h1>
      <p className="mt-2 text-sm text-text-muted">
        <Link href="/admin/taller" className="text-steel underline">← Volver a la red de servicio</Link>
      </p>
      <div className="mt-6">
        <ServiceForm service={service} />
      </div>
    </div>
  );
}