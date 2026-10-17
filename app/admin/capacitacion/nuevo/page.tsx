import Link from "next/link";
import { CourseForm } from "@/components/admin/course-form";

export default function NuevoCursoPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Nuevo curso</h1>
      <p className="mt-2 text-sm text-text-muted">
        <Link href="/admin/capacitacion" className="text-steel underline">← Volver a capacitación</Link>
      </p>
      <div className="mt-6">
        <CourseForm />
      </div>
    </div>
  );
}