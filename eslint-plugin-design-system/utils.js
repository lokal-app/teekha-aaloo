const fs = require('node:fs');
const path = require('node:path');

function toPosix(p) {
  return p.split(path.sep).join('/');
}

/** Path relative to the project root (cwd), posix separators. */
function relativeFile(context) {
  return toPosix(path.relative(context.cwd ?? process.cwd(), context.filename));
}

function isInTheme(context) {
  return relativeFile(context).startsWith('src/theme/');
}

function isInSrc(context) {
  return relativeFile(context).startsWith('src/');
}

const fileCache = new Map();
function readProjectFile(context, file) {
  const abs = path.resolve(context.cwd ?? process.cwd(), file);
  let stat;
  try {
    stat = fs.statSync(abs);
  } catch {
    return null;
  }
  const cached = fileCache.get(abs);
  if (cached && cached.mtimeMs === stat.mtimeMs) return cached.content;
  const content = fs.readFileSync(abs, 'utf8');
  fileCache.set(abs, { mtimeMs: stat.mtimeMs, content });
  return content;
}

/** Extracts `name: '#hex'` pairs from palette.ts. */
function readPalette(context, file) {
  const src = readProjectFile(context, file);
  if (!src) return [];
  const entries = [];
  const re = /([A-Za-z_$][\w$]*)\s*:\s*['"](#[0-9a-fA-F]{3,8})['"]/g;
  let m;
  while ((m = re.exec(src))) entries.push({ name: m[1], hex: m[2] });
  return entries;
}

/** Extracts the numeric values of the spacing scale from spacing.ts. */
function readSpacingScale(context, file) {
  const src = readProjectFile(context, file);
  if (!src) return null;
  const values = new Set();
  const re = /[A-Za-z_$][\w$]*\s*:\s*(-?\d+(?:\.\d+)?)/g;
  let m;
  while ((m = re.exec(src))) values.add(Number(m[1]));
  return values;
}

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function nearestPaletteToken(hex, palette) {
  if (!palette.length || !/^#[0-9a-f]{3,8}$/i.test(hex)) return null;
  const [r, g, b] = hexToRgb(hex);
  let best = null;
  for (const entry of palette) {
    const [r2, g2, b2] = hexToRgb(entry.hex);
    const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (!best || d < best.d) best = { ...entry, d };
  }
  return best;
}

function propertyName(node) {
  if (!node || node.type !== 'Property' || node.computed) return null;
  if (node.key.type === 'Identifier') return node.key.name;
  if (node.key.type === 'Literal' && typeof node.key.value === 'string') return node.key.value;
  return null;
}

function numericValue(node) {
  if (node.type === 'Literal' && typeof node.value === 'number') return node.value;
  if (
    node.type === 'UnaryExpression' &&
    node.operator === '-' &&
    node.argument.type === 'Literal' &&
    typeof node.argument.value === 'number'
  ) {
    return -node.argument.value;
  }
  return null;
}

module.exports = {
  relativeFile,
  isInTheme,
  isInSrc,
  readPalette,
  readSpacingScale,
  nearestPaletteToken,
  propertyName,
  numericValue,
  toPosix,
};
