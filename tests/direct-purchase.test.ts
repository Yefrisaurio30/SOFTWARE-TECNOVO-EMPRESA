import { describe, expect, it } from "vitest";
import {
  cartPurchaseMessage,
  defaultNumber,
  directPurchaseMessage,
  waCartPurchaseLink,
  waDirectPurchaseLink,
} from "@/lib/whatsapp";

/**
 * Flujo de compra directa por WhatsApp (pasarela Wompi desactivada).
 * El mensaje y el enlace son la "verdad" del botón de compra.
 */
describe("directPurchaseMessage", () => {
  it("incluye producto y precio formateado en COP", () => {
    const msg = directPurchaseMessage({ name: "TEC CR4 Pro", price: 12900000 });
    expect(msg).toContain("*Producto:* TEC CR4 Pro");
    expect(msg).toContain("*Precio:* $");
    expect(msg).toContain("12.900.000");
    expect(msg).toContain("coordinar la compra directa");
  });

  it("usa el título si no hay nombre", () => {
    const msg = directPurchaseMessage({ title: "Casco Urbano", price: 189000 });
    expect(msg).toContain("*Producto:* Casco Urbano");
  });

  it("cae a 'Producto Tecnovo' y precio vacío si no hay datos", () => {
    const msg = directPurchaseMessage(null);
    expect(msg).toContain("*Producto:* Producto Tecnovo");
    expect(msg).toContain("*Precio:* \n");
  });

  it("no pone precio si price no es número", () => {
    const msg = directPurchaseMessage({ name: "Guantes" });
    expect(msg).toContain("*Producto:* Guantes");
    expect(msg).not.toMatch(/\*\*Precio:/);
  });
});

describe("waDirectPurchaseLink", () => {
  it("apunta a wa.me con el mensaje codificado", () => {
    const url = waDirectPurchaseLink({ name: "TEC ONE", price: 6900000 });
    expect(url.startsWith("https://wa.me/")).toBe(true);
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toContain("TEC ONE");
  });

  it("usa el número por defecto del entorno si no se pasa uno", () => {
    const url = waDirectPurchaseLink({ name: "X" });
    const to = url.replace("https://wa.me/", "").split("?")[0];
    expect(to).toBe(defaultNumber());
  });

  it("respeta el número que se le pasa", () => {
    const url = waDirectPurchaseLink({ name: "X" }, "573001112233");
    expect(url.startsWith("https://wa.me/573001112233?text=")).toBe(true);
  });
});

describe("cartPurchaseMessage", () => {
  it("lista las líneas y el subtotal", () => {
    const msg = cartPurchaseMessage(
      [
        { name: "TEC ONE", qty: 1, price: 6900000 },
        { name: "Casco Urbano", qty: 2, price: 189000 },
      ],
      7278000,
    );
    expect(msg).toContain("- 1 × TEC ONE");
    expect(msg).toContain("- 2 × Casco Urbano");
    expect(msg).toContain("*Total (informativo):* $");
    expect(msg).toContain("7.278.000");
  });
});

describe("waCartPurchaseLink", () => {
  it("codifica el mensaje del carrito", () => {
    const url = waCartPurchaseLink([{ name: "TEC FORCE", qty: 1, price: 8900000 }]);
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toContain("TEC FORCE");
  });
});
