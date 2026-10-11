import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getMyDistributor() {
  const session = await auth();
  if (!session?.user) return { session: null, profile: null };
  const profile = await prisma.distributorProfile.findUnique({
    where: { userId: session.user.id },
  });
  return { session, profile };
}

/** Roles con acceso al catálogo mayorista: MAYORISTA directo + DISTRIBUIDOR legado. */
export function isWholesaleRole(role?: string | null): boolean {
  return role === "MAYORISTA" || role === "DISTRIBUIDOR";
}

/** Mínimo de unidades: del perfil de empresa, o 1 para MAYORISTA directo. */
export function minUnitsFor(profile: { minUnits: number } | null): number {
  return profile?.minUnits ?? 1;
}

/** Empresa a mostrar: del perfil, o el nombre del usuario mayorista. */
export function companyFor(profile: { company: string } | null, fallback: string): string {
  return profile?.company ?? fallback;
}

/** Solo mayorista: rol MAYORISTA directo o DISTRIBUIDOR con perfil APROBADO. Redirige si no aplica. */
export async function requireApprovedDistributor() {
  const { session, profile } = await getMyDistributor();
  if (!session?.user) redirect("/login?next=/distribuidores/catalogo");
  if (session.user.role === "MAYORISTA") return { session, profile };
  if (!profile) redirect("/distribuidores/registro");
  if (profile.status !== "APROBADO" || session.user.role !== "DISTRIBUIDOR") {
    redirect("/distribuidores/registro?estado=pendiente");
  }
  return { session, profile };
}
