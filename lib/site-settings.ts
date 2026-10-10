import { cache } from "react";
import { prisma } from "@/lib/prisma";

const ENV_WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP ?? "573001112233").replace(/\D/g, "");

export const getSetting = cache(async (key: string): Promise<unknown> => {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
});

export async function getWhatsAppNumber(): Promise<string> {
  const v = await getSetting("WHATSAPP_NUMBER");
  if (typeof v === "string" && v.replace(/\D/g, "").length >= 7) {
    return v.replace(/\D/g, "");
  }
  return ENV_WHATSAPP;
}
