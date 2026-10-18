/**
 * Fija la contrasena del administrador sin tocar el catalogo.
 *
 * No usar `npm run db:seed` para esto: `prisma/seed.ts:77` borra las motos
 * nuevas que no tengan pedidos y reescribe el catalogo entero. Este script solo
 * hace un UPDATE sobre `User`.
 *
 * Uso (las dos van por entorno, nunca en la linea de comandos):
 *   $env:ADMIN_EMAIL = "jefe@tecnovo.com"
 *   $env:ADMIN_PASSWORD = "..."
 *   node scripts/set-admin-password.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function loadEnv() {
  for (const name of [".env.production.local", ".env"]) {
    const path = join(process.cwd(), name);
    if (!existsSync(path)) continue;
    try {
      process.loadEnvFile(path);
    } catch {
      for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        if (key && process.env[key] === undefined) process.env[key] = line.slice(eq + 1).trim();
      }
    }
  }
}

loadEnv();

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Faltan ADMIN_EMAIL o ADMIN_PASSWORD en el entorno.");
  console.error("");
  console.error("  $env:ADMIN_EMAIL = \"jefe@tecnovo.com\"");
  console.error("  $env:ADMIN_PASSWORD = \"...\"");
  process.exit(1);
}

if (password.length < 10) {
  console.error(`La contrasena tiene ${password.length} caracteres. Minimo 10.`);
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });

  const user = existing
    ? await prisma.user.update({
        where: { email },
        data: { passwordHash, role: "SUPERADMIN", email },
        select: { email: true, role: true, updatedAt: true },
      })
    : await prisma.user.create({
        data: { name: "Jefe TECNOVO", email, role: "SUPERADMIN", passwordHash },
        select: { email: true, role: true, updatedAt: true },
      });

  console.log(`${existing ? "Actualizado" : "Creado"}: ${user.email} (${user.role})`);
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}