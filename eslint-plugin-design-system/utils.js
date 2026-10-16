const fs = require('node:fs');
const path = require('node:path');

function toPosix(p) {
  return p.split(path.sep).join('/');
}

/** Path relative to the project root (cwd), posix separators. */
function relativeFile(context) {
  return toPosix(path.relative(context.cwd ?? process.cwd(), context.filename));
}

const fileCache = new Map();
/** Reads a project file (cached by mtime); null when it doesn't exist. */
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

/** Every Kagaz export name the app can see (scripts/kagaz-exports.mjs output). */
function kagazExportNames(context) {
  const raw = readProjectFile(context, 'eslint-plugin-design-system/kagaz-exports.json');
  if (!raw) return new Set();
  const data = JSON.parse(raw);
  return new Set([
    ...(data.shared ?? []),
    ...Object.values(data.brandSubpaths ?? {}).flat(),
    ...(data.navigation ?? []),
  ]);
}

function propertyName(node) {
  if (!node || node.type !== 'Property' || node.computed) return null;
  if (node.key.type === 'Identifier') return node.key.name;
  if (node.key.type === 'Literal' && typeof node.key.value === 'string') return node.key.value;
  return null;
}

/** Local names bound by `import { A, B as C } from '@/components/ui'` in this file. */
function gatewayImports(program) {
  const names = new Map(); // local → imported
  for (const stmt of program.body) {
    if (stmt.type !== 'ImportDeclaration' || stmt.source.value !== '@/components/ui') continue;
    for (const spec of stmt.specifiers) {
      if (spec.type === 'ImportSpecifier') names.set(spec.local.name, spec.imported.name);
    }
  }
  return names;
}

module.exports = {
  toPosix,
  relativeFile,
  readProjectFile,
  kagazExportNames,
  propertyName,
  gatewayImports,
};
