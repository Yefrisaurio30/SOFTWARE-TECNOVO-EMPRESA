import Link from "next/link";
import { ServiceForm } from "@/components/admin/service-form";

export default function NuevoServicioPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Nuevo punto de servicio</h1>
      <p className="mt-2 text-sm text-text-muted">
        <Link href="/admin/taller" className="text-steel underline">← Volver a la red de servicio</Link>
      </p>
      <div className="mt-6">
        <ServiceForm />
      </div>
    </div>
  );
}