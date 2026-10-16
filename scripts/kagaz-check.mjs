// `pnpm kagaz:check` — the Kagaz repo gate (§A12). Fails on any drift between the app and Kagaz.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = process.cwd();
const require = createRequire(path.join(root, 'package.json'));
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });
const warn = (name, detail) => results.push({ name, ok: true, warn: true, detail });

const pkg = JSON.parse(read('package.json'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const versionOf = (name, from = root) => {
  try {
    const r = createRequire(path.join(from, 'package.json'));
    return JSON.parse(fs.readFileSync(r.resolve(`${name}/package.json`), 'utf8')).version;
  } catch {
    return null;
  }
};
const dirOf = (name) => path.dirname(require.resolve(`${name}/package.json`));
const EXACT = /^\d+\.\d+\.\d+(-[\w.]+)?$/;

// 1–3. Exactly one brand, the same one everywhere.
const brands = Object.keys(pkg.dependencies ?? {}).filter((d) =>
  d.startsWith('@lokal-app/kagaz-brand-'),
);
check(
  'exactly one @lokal-app/kagaz-brand-* dependency',
  brands.length === 1,
  brands.join(', ') || 'none',
);
const brand = brands[0];
const brandId = brand?.replace('@lokal-app/kagaz-brand-', '');
check(
  'src/theme/brand.ts imports that brand',
  !!brand && read('src/theme/brand.ts').includes(`'${brand}'`),
);
check(
  'app.config.ts lists the brand font plugin',
  !!brand && read('app.config.ts').includes(`'${brand}'`),
);

const srcFiles = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', 'src'],
  { cwd: root, encoding: 'utf8' },
)
  .split('\n')
  .filter((f) => /\.(ts|tsx)$/.test(f) && fs.existsSync(path.join(root, f)));
const kagazImport = /from\s+'(@lokal-app\/kagaz-[^']+)'/g;
const outside = [];
const otherBrand = [];
for (const f of srcFiles) {
  for (const [, spec] of read(f).matchAll(kagazImport)) {
    if (!f.startsWith('src/components/ui/') && !f.startsWith('src/theme/'))
      outside.push(`${f} → ${spec}`);
    const m = /^@lokal-app\/kagaz-brand-([\w-]+)/.exec(spec);
    if (m && m[1] !== brandId) otherBrand.push(`${f} → ${spec}`);
  }
}
check("no other brand's package imported in src/", otherBrand.length === 0, otherBrand.join('; '));
check(
  'Kagaz imported only in components/ui/ and theme/ (gateway)',
  outside.length === 0,
  outside.join('; '),
);

// 4–5. Exact pins, components = tokens, brand peers accept them.
const comp = '@lokal-app/kagaz-components';
check(`${comp} pinned exactly`, EXACT.test(deps[comp] ?? ''), deps[comp]);
check(`${brand} pinned exactly`, EXACT.test(deps[brand] ?? ''), deps[brand]);
const compV = versionOf(comp);
const tokensV = compV && versionOf('@lokal-app/kagaz-tokens', dirOf(comp));
check(
  'kagaz-components and kagaz-tokens at the same version',
  !!compV && compV === tokensV,
  `${compV} / ${tokensV}`,
);
const caretOk = (range, v) => {
  const base = /^\^?(.+)$/.exec(range ?? '')?.[1];
  if (!base || !v) return false;
  const parse = (s) => {
    const [core, pre = ''] = s.split('-');
    return { nums: core.split('.').map(Number), pre };
  };
  const a = parse(base),
    b = parse(v);
  if (a.nums[0] !== b.nums[0]) return false;
  for (let i = 0; i < 3; i++) if (a.nums[i] !== b.nums[i]) return b.nums[i] > a.nums[i];
  return (
    !a.pre || (b.pre && b.pre.localeCompare(a.pre, undefined, { numeric: true }) >= 0) || !b.pre
  );
};
const brandPeers = brand
  ? (JSON.parse(fs.readFileSync(path.join(dirOf(brand), 'package.json'), 'utf8'))
      .peerDependencies ?? {})
  : {};
for (const [peer, v] of [
  [comp, compV],
  ['@lokal-app/kagaz-tokens', tokensV],
]) {
  if (brandPeers[peer])
    check(`${brand} peer ${peer}@${brandPeers[peer]} accepts ${v}`, caretOk(brandPeers[peer], v));
}

// Single instance: two kagaz-components copies would mean two theme contexts (runtime crash).
const lock = fs.existsSync(path.join(root, 'pnpm-lock.yaml')) ? read('pnpm-lock.yaml') : '';
const snapshots = new Set(
  [...lock.matchAll(/^ {2}'?(@lokal-app\/kagaz-components@[^':]+)'?:$/gm)].map((m) => m[1]),
);
const instances = [...snapshots].filter((s) => s.includes('('));
check(
  'one kagaz-components instance in pnpm-lock.yaml',
  instances.length <= 1,
  `${instances.length} instance(s)`,
);

// 6. Token-value lint: exactly one tier active.
const eslintConfig = read('eslint.config.mjs');
const tpFlag = /const USE_TOKEN_POLICE = (true|false);/.exec(eslintConfig)?.[1];
check('eslint.config.mjs declares USE_TOKEN_POLICE', tpFlag !== undefined);
const tpV = versionOf('@lokal-app/kagaz-token-police');
if (tpFlag === 'true') {
  check('token-police installed at the Kagaz release', !!tpV, tpV ?? 'not installed');
} else {
  warn(
    'token-police (opt-in)',
    tpV
      ? `installed (${tpV}) but not enabled — run /enable-token-police`
      : 'not enabled — default rule design-system/no-raw-style-values is active',
  );
}

// 7. Kagaz peers.
for (const peer of ['react-native-svg', 'expo-font']) check(`${peer} installed`, !!versionOf(peer));

// 8–9. Generated files match the installed Kagaz; every gateway name exists.
const exportsFile = 'eslint-plugin-design-system/kagaz-exports.json';
const gen = fs.existsSync(path.join(root, exportsFile)) ? JSON.parse(read(exportsFile)) : null;
check(
  'kagaz-exports.json generated from the installed Kagaz',
  !!gen && gen.kagazVersion === compV && gen.brandVersion === versionOf(brand),
  gen
    ? `${gen.kagazVersion}/${gen.brandVersion} vs ${compV}/${versionOf(brand)} — run node scripts/kagaz-exports.mjs`
    : 'missing',
);
if (gen) {
  const known = {
    'src/components/ui/kagaz.ts': new Set(gen.shared),
    'src/components/ui/navigation.ts': new Set(gen.navigation),
    'src/components/ui/brand.ts': new Set(Object.values(gen.brandSubpaths ?? {}).flat()),
  };
  const missing = [];
  for (const [file, names] of Object.entries(known)) {
    if (!fs.existsSync(path.join(root, file))) {
      missing.push(`${file} missing`);
      continue;
    }
    for (const block of read(file).matchAll(/export\s*\{([^}]*)\}\s*from/g)) {
      for (const raw of block[1].split(',')) {
        const name = raw
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)[0]
          .trim();
        if (name && !names.has(name)) missing.push(`${file}: ${name}`);
      }
    }
  }
  check(
    'every components/ui re-export exists in the installed Kagaz',
    missing.length === 0,
    missing.join('; '),
  );
}

// 10. Kagaz is never patched.
const patches = fs.existsSync(path.join(root, 'patches'))
  ? fs.readdirSync(path.join(root, 'patches')).filter((f) => f.includes('lokal-app'))
  : [];
check('no patches/@lokal-app*', patches.length === 0, patches.join(', '));

let failed = 0;
for (const r of results) {
  console.log(
    `${r.warn ? '⚠' : r.ok ? '✓' : '✗'} ${r.name}${r.detail && (!r.ok || r.warn) ? `\n    ${r.detail}` : ''}`,
  );
  if (!r.ok) failed++;
}
console.log(
  `\nkagaz:check ${failed ? `FAILED (${failed})` : 'passed'} — Kagaz ${compV}, ${brand}@${versionOf(brand)}`,
);
process.exit(failed ? 1 : 0);
