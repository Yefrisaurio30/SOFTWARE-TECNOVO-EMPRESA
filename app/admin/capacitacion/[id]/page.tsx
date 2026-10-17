import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "@/components/admin/course-form";

export default async function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Editar: {course.title}</h1>
      <p className="mt-2 text-sm text-text-muted">
        <Link href="/admin/capacitacion" className="text-steel underline">← Volver a capacitación</Link>
      </p>
      <div className="mt-6">
        <CourseForm course={course} />
      </div>
    </div>
  );
}