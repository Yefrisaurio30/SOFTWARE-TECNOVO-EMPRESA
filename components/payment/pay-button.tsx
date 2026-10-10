"use client";

import { useState } from "react";

export function PayButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/wompi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        setError(json.error ?? "No se pudo iniciar el pago");
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={pay}
        disabled={loading}
        className="w-full rounded-full bg-white py-3 text-[15px] font-medium text-black transition hover:scale-[1.01] disabled:opacity-60"
      >
        {loading ? "Conectando con Wompi…" : "Pagar en línea"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <p className="mt-2 text-center text-xs text-text-faint">
        Pago seguro con Wompi. Serás redirigido al checkout.
      </p>
    </div>
  );
}
