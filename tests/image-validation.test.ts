import { describe, expect, it } from "vitest";
import {
  checkImage,
  detectImage,
  formatKB,
  MAX_FILE_BYTES,
  overLimitMessage,
} from "@/lib/image-validation";

const bytes = (...b: number[]) => new Uint8Array(b);
const pad = (head: number[], total = 64) => {
  const a = new Uint8Array(total);
  a.set(head, 0);
  return a;
};

describe("detectImage", () => {
  it("reconoce JPEG, PNG y GIF por sus bytes", () => {
    expect(detectImage(bytes(0xff, 0xd8, 0xff, 0xe0, 0x00))?.ext).toBe(".jpg");
    expect(detectImage(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.ext).toBe(".png");
    expect(detectImage(bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))?.ext).toBe(".gif");
  });

  it("reconoce WEBP y AVIF/HEIC por su contenedor", () => {
    const webp = pad([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
    expect(detectImage(webp)?.ext).toBe(".webp");
    // caja ISO-BMFF: [tamaño 4 bytes][ "ftyp" ][ marca "avif" ]
    const avif = pad([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]);
    expect(detectImage(avif)?.ext).toBe(".avif");
    const heic = pad([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]);
    expect(detectImage(heic)?.ext).toBe(".heic");
  });

  it("devuelve null si no es una imagen", () => {
    expect(detectImage(bytes(0x3c, 0x21, 0x44, 0x4f, 0x43, 0x54, 0x59, 0x50, 0x45))).toBeNull();
    expect(detectImage(bytes(0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37))).toBeNull();
    expect(detectImage(bytes(0x7f, 0x45, 0x4c, 0x46))).toBeNull();
  });

  it("no confunde texto con una imagen truncada", () => {
    expect(detectImage(bytes(0x47, 0x49, 0x46))).toBeNull();
    expect(detectImage(bytes())).toBeNull();
  });
});

describe("checkImage", () => {
  const jpeg = pad([0xff, 0xd8, 0xff, 0xe0]);

  it("acepta una imagen válida", () => {
    const r = checkImage(jpeg);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.detected.mime).toBe("image/jpeg");
  });

  it("rechaza un HTML disfrazado de .jpg (XSS almacenado)", () => {
    const evil = pad([0x3c, 0x68, 0x74, 0x6d, 0x6c, 0x3e, 0x3c, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74]);
    const r = checkImage(evil);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("no-es-imagen");
  });

  it("reconoce TIFF por su cabecera II* o MM*", () => {
    expect(detectImage(bytes(0x49, 0x49, 0x2a, 0x00, 0x00))?.mime).toBe("image/tiff");
    expect(detectImage(bytes(0x4d, 0x4d, 0x00, 0x2a, 0x00))?.mime).toBe("image/tiff");
  });

  it("reconoce SVG (se rasteriza a WebP antes de guardar, sin riesgo de XSS)", () => {
    const svg = pad([0x3c, 0x73, 0x76, 0x67, 0x20, 0x78, 0x6d, 0x6c, 0x3e]);
    const r = checkImage(svg);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.detected.mime).toBe("image/svg+xml");
  });

  it("rechaza archivo vacío y archivo mayor al tope", () => {
    const empty = checkImage(new Uint8Array(0));
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.reason).toBe("vacio");

    const big = checkImage(new Uint8Array(MAX_FILE_BYTES + 1));
    expect(big.ok).toBe(false);
    if (!big.ok) expect(big.reason).toBe("demasiado-grande");
  });
});

describe("formatKB y mensaje de exceso", () => {
  it("redondea hacia arriba en KB", () => {
    expect(formatKB(1)).toBe("1 KB");
    expect(formatKB(1024)).toBe("1 KB");
    expect(formatKB(1025)).toBe("2 KB");
  });

  it("usa KB en base 1024 y compone MB + KB", () => {
    expect(formatKB(400 * 1024)).toBe("400 KB");
    expect(formatKB(1024 * 1024)).toBe("1 MB");
    expect(formatKB(1024 * 1024 + 512 * 1024)).toBe("1 MB 512 KB");
  });

  it("arma el mensaje que pidió el cliente", () => {
    expect(overLimitMessage(400 * 1024)).toBe(
      "Te pasaste por 400 KB. No se puede subir la publicación.",
    );
  });
});