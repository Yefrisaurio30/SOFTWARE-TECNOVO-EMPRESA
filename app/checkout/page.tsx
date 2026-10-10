"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { cartSubtotal, useCartStore } from "@/store/cart-store";
import { CreateOrderInput } from "@/lib/order-validation";
import { formatCOP } from "@/lib/money";
import { Container, SectionHeading } from "@/components/ui/section";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";
const errCls = "mt-1 text-xs text-danger";

type FormValues = {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  city: string;
  address: string;
  delivery: "ENVIO" | "RECOGER";
};

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { delivery: "ENVIO", contactEmail: "" },
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (values: FormValues) => {
    setFieldErrors({});
    setServerError("");
    const payload = {
      ...values,
      items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
    };
    const parsed = CreateOrderInput.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "items");
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = (await res.json()) as { orderId?: string; error?: string };
      if (!res.ok || !json.orderId) {
        setServerError(json.error ?? "No se pudo crear el pedido");
        return;
      }
      clear();
      router.push(`/pedido/${json.orderId}`);
    } catch {
      setServerError("Error de red. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  if (lines.length === 0) {
    return (
      <main className="bg-black py-10 text-text md:py-14">
        <Container>
          <SectionHeading eyebrow="Compra" title="Checkout." />
          <div className="mt-8 rounded-[28px] border border-white/10 bg-surface p-10 text-center">
            <p className="text-lg font-semibold">No hay nada para pagar</p>
            <Link
              href="/motos-electricas"
              className="mt-5 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black"
            >
              Volver al catálogo
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-black py-10 text-text md:py-14">
      <Container>
        <SectionHeading
          eyebrow="Compra"
          title="Checkout."
          description="Tus datos para la entrega. El total se confirma en el servidor."
        />
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-5 rounded-[28px] border border-white/10 bg-surface p-6 md:p-8">
            <div>
              <label htmlFor="co-name" className={labelCls}>Nombre completo</label>
              <input id="co-name" autoComplete="name" placeholder="María Pérez" className={inputCls} {...register("contactName")} />
              {fieldErrors.contactName ? <p className={errCls}>{fieldErrors.contactName}</p> : null}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="co-phone" className={labelCls}>Celular</label>
                <input id="co-phone" autoComplete="tel" placeholder="300 123 4567" className={inputCls} {...register("contactPhone")} />
                {fieldErrors.contactPhone ? <p className={errCls}>{fieldErrors.contactPhone}</p> : null}
              </div>
              <div>
                <label htmlFor="co-email" className={labelCls}>Correo (opcional)</label>
                <input id="co-email" type="email" autoComplete="email" placeholder="maria@correo.co" className={inputCls} {...register("contactEmail")} />
                {fieldErrors.contactEmail ? <p className={errCls}>{fieldErrors.contactEmail}</p> : null}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="co-city" className={labelCls}>Ciudad</label>
                <input id="co-city" autoComplete="address-level2" placeholder="Bogotá" className={inputCls} {...register("city")} />
                {fieldErrors.city ? <p className={errCls}>{fieldErrors.city}</p> : null}
              </div>
              <div>
                <label htmlFor="co-address" className={labelCls}>Dirección</label>
                <input id="co-address" autoComplete="street-address" placeholder="Calle 10 # 20-30, Apto 101" className={inputCls} {...register("address")} />
                {fieldErrors.address ? <p className={errCls}>{fieldErrors.address}</p> : null}
              </div>
            </div>
            <fieldset>
              <legend className={cn(labelCls, "mb-2")}>Entrega</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 has-checked:border-steel">
                  <input type="radio" value="ENVIO" className="accent-white" {...register("delivery")} />
                  <span>
                    <span className="block text-[15px] font-medium">Envío a domicilio</span>
                    <span className="block text-xs text-text-muted">Coordinamos por WhatsApp</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 has-checked:border-steel">
                  <input type="radio" value="RECOGER" className="accent-white" {...register("delivery")} />
                  <span>
                    <span className="block text-[15px] font-medium">Recoger en tienda</span>
                    <span className="block text-xs text-text-muted">Bogotá · Medellín · Cali</span>
                  </span>
                </label>
              </div>
            </fieldset>
            {fieldErrors.items ? <p className={errCls}>{fieldErrors.items}</p> : null}
            {serverError ? (
              <p role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm">
                {serverError}
              </p>
            ) : null}
          </div>
          <aside className="h-fit rounded-[24px] border border-white/10 bg-surface p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold">Resumen</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {lines.map((l) => (
                <li key={l.productId} className="flex justify-between gap-3">
                  <span className="truncate text-text-muted">
                    {l.qty} × {l.name}
                  </span>
                  <span className="shrink-0 tabular-nums">{formatCOP(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
              <span className="text-text-muted">Subtotal</span>
              <span className="text-xl font-semibold tabular-nums">{formatCOP(cartSubtotal(lines))}</span>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="mt-5 w-full rounded-full bg-white py-3 text-[15px] font-medium text-black transition hover:scale-[1.01] disabled:opacity-60"
            >
              {sending ? "Creando pedido…" : "Confirmar pedido"}
            </button>
            <p className="mt-2 text-center text-xs text-text-faint">
              El pago con Wompi se habilita en el siguiente paso.
            </p>
          </aside>
        </form>
      </Container>
    </main>
  );
}
