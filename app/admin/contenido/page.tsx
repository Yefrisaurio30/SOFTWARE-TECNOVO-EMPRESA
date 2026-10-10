import { prisma } from "@/lib/prisma";
import { saveWhatsAppNumber } from "@/lib/admin-actions";

export default async function ContenidoPage() {
  const current = await prisma.siteSetting.findUnique({ where: { key: "WHATSAPP_NUMBER" } });

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight">Contenido</h1>
      <form
        action={async (fd: FormData) => {
          "use server";
          await saveWhatsAppNumber({ number: String(fd.get("number")) });
        }}
        className="mt-6 rounded-[24px] border border-white/10 bg-surface p-6"
      >
        <label htmlFor="ct-wa" className="mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase">
          WhatsApp de contacto (solo dígitos, con indicativo)
        </label>
        <input
          id="ct-wa"
          name="number"
          required
          defaultValue={typeof current?.value === "string" ? current.value : ""}
          placeholder={process.env.NEXT_PUBLIC_WHATSAPP ?? "573001112233"}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-[15px] outline-none focus:border-steel/60"
        />
        <p className="mt-2 text-xs text-text-faint">
          Actualiza el botón flotante, el CTA de prueba de manejo y los botones de producto.
        </p>
        <button type="submit" className="mt-4 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black">
          Guardar
        </button>
      </form>
    </div>
  );
}
