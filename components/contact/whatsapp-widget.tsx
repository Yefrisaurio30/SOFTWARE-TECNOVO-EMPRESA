"use client";

import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

export function WhatsAppWidget() {
  const href = waLink("Hola TECNOVO, quiero más información. ¿Me ayudan?");

  const onClick = () => {
    window.dispatchEvent(new CustomEvent("tecnovo:whatsapp-click", { detail: { href } }));
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label="Hablar con TECNOVO por WhatsApp"
      className="fixed right-5 bottom-5 z-50 grid size-13 place-items-center rounded-full border bg-graphite text-text transition hover:scale-105"
      style={{ width: 52, height: 52, borderColor: "#B8C2CF" }}
    >
      <MessageCircle size={22} aria-hidden />
    </a>
  );
}
