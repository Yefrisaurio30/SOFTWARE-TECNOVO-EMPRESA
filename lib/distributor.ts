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

/** Solo distribuidor APROBADO. Redirige si no aplica. */
export async function requireApprovedDistributor() {
  const { session, profile } = await getMyDistributor();
  if (!session?.user) redirect("/login?next=/distribuidores/catalogo");
  if (!profile) redirect("/distribuidores/registro");
  if (profile.status !== "APROBADO" || session.user.role !== "DISTRIBUIDOR") {
    redirect("/distribuidores/registro?estado=pendiente");
  }
  return { session, profile };
}
