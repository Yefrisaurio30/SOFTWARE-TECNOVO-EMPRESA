"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const KEY = "splash-seen-v1";

/** Pantalla de carga de 600 ms, solo en la primera visita de la sesión. */
export function Splash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!sessionStorage.getItem(KEY)) {
        setShow(true);
        timer = setTimeout(() => {
          setShow(false);
          sessionStorage.setItem(KEY, "1");
        }, 600);
      }
    } catch {
      // Sin sessionStorage (SSR/privado): no mostrar.
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[80] grid place-items-center bg-black"
          aria-hidden
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/brand/tecnovo-logo-original.png"
              alt=""
              width={180}
              height={180}
              priority
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
