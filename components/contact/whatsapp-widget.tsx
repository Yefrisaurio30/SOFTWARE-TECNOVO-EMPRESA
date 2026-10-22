"use client";

import { waLink } from "@/lib/whatsapp";

export function WhatsAppWidget({ number }: { number: string }) {
  const href = waLink("Hola TECNOVO, quiero más información. ¿Me ayudan?", number);

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
      <svg
        viewBox="0 0 32 32"
        width={26}
        height={26}
        aria-hidden
        fill="#25D366"
      >
        <path d="M16.004 3C9.374 3 4 8.373 4 15c0 2.61.846 5.027 2.278 7.002L4 29l7.18-2.25A11.93 11.93 0 0 0 16.004 27C22.633 27 28 21.627 28 15S22.633 3 16.004 3zm0 22a9.94 9.94 0 0 1-5.06-1.38l-.36-.214-4.26 1.336 1.35-4.15-.234-.38A9.94 9.94 0 0 1 6.004 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.49-7.48c-.301-.15-1.78-.878-2.056-.978-.276-.1-.478-.15-.68.15-.201.301-.78.978-.957 1.18-.176.201-.353.226-.654.075-.301-.15-1.27-.468-2.42-1.492-.895-.8-1.5-1.79-1.677-2.09-.176-.301-.019-.464.132-.614.135-.135.301-.352.452-.527.15-.176.201-.301.301-.502.1-.201.05-.377-.025-.527-.075-.15-.68-1.638-.931-2.243-.245-.588-.495-.508-.68-.517l-.58-.01c-.201 0-.527.075-.803.377-.276.301-1.054 1.03-1.054 2.51 0 1.48 1.08 2.91 1.23 3.112.15.201 2.124 3.242 5.144 4.547.719.31 1.28.496 1.716.634.722.23 1.379.197 1.9.12.579-.087 1.78-.728 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.352z" />
      </svg>
    </a>
  );
}