/**
 * Sube las variables de entorno de produccion a Vercel.
 *
 * Lee `.env.production.local` (esta en `.gitignore`) y las empuja con el CLI.
 * El valor viaja por stdin, nunca por la linea de comandos, para que no quede
 * en el historial ni sea visible en la lista de procesos.
 *
 * Uso:
 *   node scripts/vercel-env-sync.mjs           # sube lo que falte
 *   node scripts/vercel-env-sync.mjs --dry-run # solo muestra que encuentra
 *
 * Requisitos previos (una vez):
 *   npm i -g vercel
 *   vercel login
 *   vercel link
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE = join(process.cwd(), ".env.production.local");
const ENVIRONMENT = "production";
const dryRun = process.argv.includes("--dry-run");

/** Sin esto la app no arranca en produccion. */
const REQUIRED = [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "AUTH_URL",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_WHATSAPP",
  "WOMPI_PUBLIC_KEY",
  "WOMPI_INTEGRITY_SECRET",
  "WOMPI_EVENTS_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

/** Esta fase del despliegue depende de los dos. */
const REQUIRED_FOR_SUPABASE = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

/**
 * Vercel obliga a guardar como Config (no Secret) lo que lleva prefijo
 * NEXT_PUBLIC_, asi que ahi no se pasa --sensitive.
 */
const isPublic = (name) => name.startsWith("NEXT_PUBLIC_");

function parseEnv(text) {
  const vars = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const name = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }
    if (name) vars[name] = value;
  }
  return vars;
}

/**
 * Chequeos sobre DATABASE_URL. El pooler de transaccion de Supabase es la
 * fuente numero uno de caidas: si le falta `pgbouncer=true`, Prisma se come
 * el pool y la web se cae a los 15 minutos.
 */
function checkDatabaseUrl(url) {
  const problems = [];
  if (!url) return problems;
  if (/localhost|127\.0\.0\.1/.test(url)) {
    problems.push("apunta a la base de datos local, no a Supabase");
  }
  const port = url.match(/:(\d+)\//)?.[1];
  if (port === "6543" && !url.includes("pgbouncer=true")) {
    problems.push("usa el puerto 6543 (pooler de transaccion) pero no trae pgbouncer=true");
  }
  if (url.includes(".supabase.co") && !url.includes("sslmode=require")) {
    problems.push("falta sslmode=require");
  }
  return problems;
}

function run(args, input) {
  return spawnSync("vercel", args, {
    input,
    encoding: "utf8",
    shell: process.platform === "win32",
    timeout: 120_000,
  });
}

if (!existsSync(SOURCE)) {
  console.error(`No existe ${SOURCE}`);
  console.error("");
  console.error("Crealo a mano con las variables de produccion. El archivo esta en");
  console.error(".gitignore, asi que nunca se sube al repo. Plantilla:");
  console.error("");
  for (const name of REQUIRED) console.error(`  ${name}=`);
  console.error("");
  console.error("Despues corre: node scripts/vercel-env-sync.mjs");
  process.exit(1);
}

const vars = parseEnv(readFileSync(SOURCE, "utf8"));
const names = Object.keys(vars);

const missing = REQUIRED.filter((name) => !vars[name]);
if (missing.length > 0) {
  console.error(`Faltan ${missing.length} variable(s) obligatorias en .env.production.local:`);
  for (const name of missing) console.error(`  - ${name}`);
  process.exit(1);
}

const dbProblems = checkDatabaseUrl(vars.DATABASE_URL);
if (dbProblems.length > 0) {
  console.error("DATABASE_URL tiene problemas:");
  for (const p of dbProblems) console.error(`  - ${p}`);
  process.exit(1);
}

if ((vars.STORAGE_DRIVER ?? "").trim() === "supabase") {
  const missingSupabase = REQUIRED_FOR_SUPABASE.filter((name) => !vars[name]);
  if (missingSupabase.length > 0) {
    console.error("STORAGE_DRIVER=supabase pero faltan:");
    for (const name of missingSupabase) console.error(`  - ${name}`);
    process.exit(1);
  }
}

console.log(`${names.length} variable(s) en .env.production.local`);
console.log("");
for (const name of names) {
  const type = isPublic(name) ? "config" : "secret";
  console.log(`  ${name.padEnd(30)} ${type}  ${"x".repeat(vars[name].length)}`);
}
console.log("");

if (dryRun) {
  console.log("--dry-run: no se sube nada.");
  process.exit(0);
}

const who = run(["whoami"]);
if (who.status !== 0) {
  console.error("El CLI de Vercel no responde. Revisa `vercel login`.");
  console.error(who.stderr ?? "");
  process.exit(1);
}
console.log(`Cuenta: ${who.stdout.trim()}`);

let failed = 0;
for (const name of names) {
  const args = ["env", "add", name, ENVIRONMENT, "--yes", "--force"];
  if (!isPublic(name)) args.push("--sensitive");

  const result = run(args, vars[name]);
  if (result.status !== 0) {
    failed += 1;
    console.error(`  FALLO ${name}`);
    console.error((result.stderr ?? result.stdout ?? "").trim());
  } else {
    console.log(`  ok ${name}`);
  }
}

console.log("");
if (failed > 0) {
  console.error(`${failed} variable(s) no se pudieron subir.`);
  process.exit(1);
}
console.log("Listo. Verificacion final:");
console.log(`  vercel env ls ${ENVIRONMENT}`);