import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  let slides: Awaited<ReturnType<typeof prisma.heroSlide.findMany>> = [];
  try {
    slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  } catch {
    slides = [];
  }

  async function createSlide(formData: FormData) {
    "use server";
    const toDataUrl = async (f: FormDataEntryValue | null) => {
      if (!(f instanceof File) || f.size === 0) return null;
      const buf = Buffer.from(await f.arrayBuffer());
      return `data:${f.type};base64,${buf.toString("base64")}`;
    };
    const image = await toDataUrl(formData.get("image"));
    if (!image) throw new Error("Imagen requerida");
    await prisma.heroSlide.create({
      data: {
        image,
        order: Number(formData.get("order") || 0),
        isActive: formData.get("isActive") === "on",
      },
    });
    revalidatePath("/admin/banners");
    revalidatePath("/");
  }

  async function deleteSlide(formData: FormData) {
    "use server";
    await prisma.heroSlide.delete({ where: { id: String(formData.get("id")) } });
    revalidatePath("/admin/banners");
    revalidatePath("/");
  }

  async function toggleSlide(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    const s = await prisma.heroSlide.findUnique({ where: { id } });
    if (!s) return;
    await prisma.heroSlide.update({ where: { id }, data: { isActive: !s.isActive } });
    revalidatePath("/admin/banners");
    revalidatePath("/");
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Banners del hero ({slides.length})</h1>

      <form action={createSlide} className="mt-6 grid gap-4 rounded-[24px] border border-white/10 bg-surface p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase">Imagen (desktop)</label>
          <input name="image" type="file" accept="image/*" required className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-text outline-none file:mr-3 file:rounded-full file:border-0 file:bg-cta file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-[#000]" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase">Orden</label>
          <input name="order" type="number" defaultValue={0} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-text outline-none" />
        </div>
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" name="isActive" defaultChecked /> Activo
          </label>
          <button type="submit" className="rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-[#000]">
            Agregar banner
          </button>
        </div>
      </form>

      <div className="mt-8 grid gap-4">
        {slides.map((s) => (
          <div key={s.id} className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-surface p-4">
            <Image src={s.image} alt={s.title ?? ""} width={112} height={64} quality={75} sizes="112px" className="h-16 w-28 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-text-faint">orden {s.order} · {s.isActive ? "activo" : "inactivo"}</p>
            </div>
            <form action={toggleSlide}>
              <input type="hidden" name="id" value={s.id} />
              <button type="submit" className="rounded-full border border-white/15 px-4 py-1.5 text-sm">
                {s.isActive ? "Desactivar" : "Activar"}
              </button>
            </form>
            <form action={deleteSlide}>
              <input type="hidden" name="id" value={s.id} />
              <button type="submit" className="rounded-full border border-danger/40 px-4 py-1.5 text-sm text-danger">
                Eliminar
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}