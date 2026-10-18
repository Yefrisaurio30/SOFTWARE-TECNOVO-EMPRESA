/**
 * Ajusta los ajustes del proyecto de Vercel que no se pueden dar por el CLI.
 *
 *   - serverlessFunctionRegion: pdx1 (Portland). La base esta en Supabase
 *     us-west-2, asi que es la region de Vercel con menos latencia hasta ella.
 *     El default es iad1 (Washington), al otro lado del pais.
 *   - commandForIgnoringBuildStep: solo deja desplegar main.
 *
 * Por que lo ultimo: en el plan Hobby las variables de Preview y Production
 * son las MISMAS. Si develop creates un preview, ese preview recibe
 * DATABASE_URL de produccion y cualquier pedido, borrador o foto subida ahi
 * cae en la base real. El script hace que los push a otras ramas no compilen.
 *
 * El token se lee del archivo de autenticacion del CLI y NO se imprime.
 *
 * Uso: node scripts/vercel-project.mjs [ver-region|ver-build|region|build|ver]
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const PROJECT_ID = "prj_TDROQNAiZHov8jUEH2WxGlfe0Jdd";

const AUTH_PATHS = [
  join(process.env.APPDATA ?? "", "com.vercel.cli", "Data", "auth.json"),
  join(homedir(), ".local", "share", "com.vercel.cli", "auth.json"),
  join(homedir(), ".vercel", "auth.json"),
];

function token() {
  for (const p of AUTH_PATHS) {
    if (!existsSync(p)) continue;
    const j = JSON.parse(readFileSync(p, "utf8"));
    if (j?.token) return j.token;
  }
  throw new Error("No se encontro el token del CLI. Corre `vercel login`.");
}

const IGNORE_STEP = "echo \"REF=[$VERCEL_GIT_COMMIT_REF] ENV=[$VERCEL_ENV] SHA=[$VERCEL_GIT_COMMIT_SHA] HEAD=[$VERCEL_GIT_PREVIOUS_SHA]\"; exit 0";

async function patch(body) {
  const res = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`PATCH ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function show() {
  const res = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  const p = await res.json();
  console.log("proyecto:    ", p.name);
  console.log("id:          ", p.id);
  console.log("region:      ", p.serverlessFunctionRegion || "(default iad1)");
  console.log("solo main:   ", p.commandForIgnoringBuildStep ? "si" : "no");
  console.log("git:         ", p.link?.type ?? "(desconectado)");
}

const [accion = "ver"] = process.argv.slice(2);
try {
  switch (accion) {
    case "region":
      console.log("region ->", (await patch({ serverlessFunctionRegion: "pdx1" })).serverlessFunctionRegion);
      break;
    case "build":
      console.log("solo main ->", (await patch({ commandForIgnoringBuildStep: IGNORE_STEP })).commandForIgnoringBuildStep);
      break;
    case "todo":
      await patch({ serverlessFunctionRegion: "pdx1", commandForIgnoringBuildStep: IGNORE_STEP });
      await show();
      break;
    default:
      await show();
  }
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}