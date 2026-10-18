import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Mantiene viva la base de datos.
 *
 * Supabase pausa los proyectos del plan gratis despues de una semana sin
 * actividad, y mientras esta pausado el sitio responde 500. Un SELECT diario
 * cuenta como actividad y evita que el cliente se encuentre la tienda caida
 * cuando vuelve a visitarla.
 *
 * No es una garantia: los criterios de pausa pueden cambiar. Si el proyecto ya
 * esta en plan de pago, esta ruta se puede borrar junto con el cron de
 * `vercel.json`.
 *
 * Proteccion: Vercel manda `Authorization: Bearer $CRON_SECRET` cuando esa
 * variable existe. Sin ella la ruta se apaga sola (404) para que no quede un
 * endpoint publico que golpee la base de datos.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Ruta desactivada: falta CRON_SECRET" }, { status: 404 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    // No se filtra el mensaje de Prisma: podria traer el host o el usuario.
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}