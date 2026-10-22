"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const KEY = "cookies-aviso-cerrado-v1";

/**
 * Aviso informativo de cookies.
 *
 * Solo guardamos en localStorage que el usuario lo cerró, para no mostrarlo en
 * cada visita. No usamos cookies propias para esto: hacerlo exigiría pedir
 * consentimiento para nuestra propia cookie de consentimiento.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      // Navegador sin almacenamiento: no lo mostramos.
    }
  }, []);

  const cerrar = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // si falla, se vuelve a mostrar la próxima visita
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="dialog"
          aria-label="Aviso de cookies"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-3xl rounded-[24px] border border-white/10 bg-graphite/97 p-5 text-text backdrop-blur-xl"
        >
          <p className="text-[15px] leading-relaxed text-text-muted">
            Usamos una cookie esencial para mantener tu sesión iniciada y guardamos tu carrito en el
            navegador para que no lo pierdas al cerrar. <strong className="text-text">No usamos
            cookies publicitarias ni de seguimiento.</strong>{" "}
            <Link
              href="/legales/politica-de-cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-steel underline"
            >
              Ver la política de cookies
            </Link>
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={cerrar}
              className="rounded-full bg-steel px-6 py-2.5 text-sm font-medium text-[#000]"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}