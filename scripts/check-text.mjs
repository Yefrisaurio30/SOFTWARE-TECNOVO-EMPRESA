/**
 * Escáner de texto corrupto.
 *
 * Los archivos de este repo han sufrido dos daños:
 *  1) Caracteres cirílicos (U+0400-U+04FF) colados en slugs, correos y slugs.
 *  2) Palabras rotas o pegadas ("queXSede", "Todoslergen", "Oils").
 *
 * Uso: node scripts/check-text.mjs [carpetas...]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

// Símbolos legítimos ya usados en la interfaz del proyecto.
const ALLOWED_SYMBOLS = new Set([
  "←", "→", "›", "‹", "…", "×", "≤", "≥", "★", "☆", "º", "ª", "•", "→", "∅", "·",
  "“", "”", "‘", "’", "…", "«", "»", "→", "−", "↑", "↓", "✓", "✗", "–", "—",
]);

// Fragmentos que SOLO aparecen cuando el texto se corrompió.
const CORRUPT_TOKENS = ["XSede", "Todoslergen", "Quea", "aerea", "Wir ", "xe de la"];

// Inglés colado en un párrafo en español (corrupción de redacción vista en este repo).
const ENGLISH_WORDS = [
  "Different", "the ", "and ", "with ", "from ", "Your ", "This "];

// Nota: no se comprueba "falta de espacio antes de (" porque en JSX es
// indistinguible de una llamada normal (abs(Math...) vs motos(Modelo...).

// Rangos que aquí nunca deben aparecer (CJK, hebreo, árabe, devanagari, tailandés).
const FOREIGN_RANGES = [
  [0x0590, 0x05ff], [0x0600, 0x06ff], [0x0900, 0x097f], [0x0e00, 0x0e7f],
  [0x3040, 0x30ff], [0x4e00, 0x9fff], [0xac00, 0xd7af], [0xff00, 0xffef],
];

const problems = [];

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (["node_modules", ".next", ".git", "uploads", "motos"].includes(name)) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    const ext = extname(name).toLowerCase();
    if (![".ts", ".tsx", ".js", ".jsx", ".mjs", ".md"].includes(ext)) continue;
    checkFile(full);
  }
}

function isForeign(cp) {
  return FOREIGN_RANGES.some(([a, b]) => cp >= a && cp <= b);
}

function checkFile(file) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    const where = `${file}:${i + 1}`;
    const snippet = line.trim().slice(0, 78);

    for (const ch of line) {
      const cp = ch.codePointAt(0);
      if (cp >= 0x0400 && cp <= 0x04ff) {
        problems.push(`${where}  cirílico U+${cp.toString(16).toUpperCase()}  "${snippet}"`);
      } else if (isForeign(cp)) {
        problems.push(`${where}  escritura Extranjera U+${cp.toString(16).toUpperCase()} ("${ch}")  "${snippet}"`);
      }
    }

    for (const token of CORRUPT_TOKENS) {
      if (line.includes(token)) {
        problems.push(`${where}  texto corrupto "${token.trim()}"  "${snippet}"`);
      }
    }
    // Inglés dentro de párrafos en español. Solo se evalúan líneas de prosa:
    // una línea de código casi nunca lleva acentos ni palabras del español.
    const isProse = /[áéíóúñÁÉÍÓÚÑ¿¡]|\b(el|la|los|las|de|que|para|con|una|por)\b/.test(line);
    if (isProse) {
      for (const w of ENGLISH_WORDS) {
        if (line.includes(w)) {
          problems.push(`${where}  posible inglés "${w.trim()}"  "${snippet}"`);
        }
      }
    }
  });
}

const dirs = process.argv.slice(2);
if (dirs.length === 0) dirs.push("app", "components", "lib", "docs", "prisma", "tests");
for (const d of dirs) walk(d);

if (problems.length === 0) {
  console.log("OK: sin texto corrupto.");
} else {
  console.log(`${problems.length} problema(s):`);
  for (const p of problems) console.log("  " + p);
  process.exitCode = 1;
}