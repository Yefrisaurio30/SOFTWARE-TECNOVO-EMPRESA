import { afterAll, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  areConsentsGiven,
  buildConsentData,
  getClientIp,
  normalizeConsentInput,
} from "@/lib/consent";

const TAG = `test-consent-${Date.now()}`;
const emails: string[] = [];

afterAll(async () => {
  await prisma.consent.deleteMany({ where: { email: { contains: TAG } } });
  await prisma.user.deleteMany({ where: { email: { contains: TAG } } });
  await prisma.$disconnect();
});

function mkEmail() {
  const e = `${TAG}-${Math.random().toString(36).slice(2, 8)}@test.co`;
  emails.push(e);
  return e;
}

describe("Validación de consentimiento (puede falsificarse en el cliente)", () => {
  it("solo acepta ambas casillas en true", () => {
    expect(areConsentsGiven({ terms: true, privacy: true })).toBe(true);
  });

  it("rechaza cualquier combinación incompleta", () => {
    for (const bad of [
      { terms: true, privacy: false },
      { terms: false, privacy: true },
      { terms: false, privacy: false },
      { terms: undefined, privacy: undefined },
      {},
      null,
      undefined,
      "true",
      { terms: "true", privacy: "true" },
      { terms: 1, privacy: 1 },
    ]) {
      expect(areConsentsGiven(bad)).toBe(false);
    }
  });

  it("normalize convierte valores truthy no booleanos en false", () => {
    expect(normalizeConsentInput({ terms: "on", privacy: 1 })).toEqual({
      terms: false,
      privacy: false,
    });
    expect(normalizeConsentInput({ terms: true, privacy: true })).toEqual({
      terms: true,
      privacy: true,
    });
  });
});

describe("Captura de IP", () => {
  it("toma el primer valor de x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" });
    expect(getClientIp(h)).toBe("203.0.113.7");
  });

  it("cae a x-real-ip si no hay forwarded-for", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("devuelve desconocido si no hay nada", () => {
    expect(getClientIp(new Headers())).toBe("desconocida");
  });
});

describe("Persistencia de la evidencia de consentimiento", () => {
  it("guarda ambas marcas de tiempo y la IP", async () => {
    const email = mkEmail();
    const data = buildConsentData({
      email,
      source: "REGISTRO",
      terms: true,
      privacy: true,
      ipAddress: "203.0.113.7",
      userAgent: "Mozilla/5.0 (test)",
    });

    expect(data.termsAccepted).toBe(true);
    expect(data.privacyAccepted).toBe(true);
    expect(data.termsAcceptedAt).toBeInstanceOf(Date);
    expect(data.privacyAcceptedAt).toBeInstanceOf(Date);
    expect(data.ipAddress).toBe("203.0.113.7");

    const row = await prisma.consent.create({ data });
    const found = await prisma.consent.findUniqueOrThrow({ where: { id: row.id } });
    expect(found.email).toBe(email);
    expect(found.source).toBe("REGISTRO");
    expect(found.termsAcceptedAt).not.toBeNull();
    expect(found.privacyAcceptedAt).not.toBeNull();
  });

  it("normaliza el correo a minúsculas", () => {
    const data = buildConsentData({
      email: "  Persona.Test@TEST.CO ",
      source: "REGISTRO",
      terms: true,
      privacy: true,
      ipAddress: "1.1.1.1",
    });
    expect(data.email).toBe("persona.test@test.co");
  });

  it("conserva la evidencia aunque se borre el usuario", async () => {
    const email = mkEmail();
    const user = await prisma.user.create({
      data: {
        email,
        name: "Se borra",
        passwordHash: await bcrypt.hash("x", 4),
      },
    });
    const row = await prisma.consent.create({
      data: {
        ...buildConsentData({
          email,
          userId: user.id,
          source: "PUBLICACION",
          terms: true,
          privacy: true,
          ipAddress: "9.9.9.9",
        }),
      },
    });

    await prisma.user.delete({ where: { id: user.id } });

    const still = await prisma.consent.findUniqueOrThrow({ where: { id: row.id } });
    expect(still.userId).toBeNull();
    expect(still.email).toBe(email);
    expect(still.ipAddress).toBe("9.9.9.9");
    expect(still.createdAt).toBeInstanceOf(Date);
  });

  it("registra una fila por cada aceptación, sin sobrescribir", async () => {
    const email = mkEmail();
    for (let i = 0; i < 2; i++) {
      await prisma.consent.create({
        data: buildConsentData({
          email,
          source: i === 0 ? "REGISTRO" : "PUBLICACION",
          terms: true,
          privacy: true,
          ipAddress: "8.8.8.8",
        }),
      });
    }
    const rows = await prisma.consent.findMany({ where: { email } });
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((r) => r.source))).toEqual(new Set(["REGISTRO", "PUBLICACION"]));
  });
});