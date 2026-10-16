// components/ui/{kagaz,brand,navigation}.ts: explicit, 1:1, pass-through re-exports only (§A7.8).
const { readProjectFile, relativeFile } = require('../utils');

const PASS_THROUGH = /^src\/components\/ui\/(kagaz|brand|navigation)\.ts$/;
const ADAPTER = /^src\/components\/ui\/adapters\//;

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'The Kagaz gateway only re-exports, 1:1' },
    schema: [],
  },
  create(context) {
    const file = relativeFile(context);
    if (ADAPTER.test(file)) {
      return {
        Program(node) {
          const first = context.sourceCode.getAllComments()[0];
          const m =
            first && first.loc.start.line === 1 && /KAGAZ-ADAPTER\(([^)]+)\)/.exec(first.value);
          if (!m) {
            context.report({
              node,
              message:
                'An adapter starts with `// KAGAZ-ADAPTER(<kagaz-version>): <what changed>` (§A7.8).',
            });
            return;
          }
          const name = file
            .split('/')
            .pop()
            .replace(/\.tsx$/, '');
          const ledger = readProjectFile(context, 'docs/kagaz-gaps.md') ?? '';
          if (!ledger.includes(name))
            context.report({
              node,
              message: `Adapter ${name} has no row in docs/kagaz-gaps.md "Adapters" (§A7.8).`,
            });
        },
      };
    }
    if (!PASS_THROUGH.test(file)) return {};
    return {
      Program(node) {
        for (const stmt of node.body) {
          const emptyExport =
            stmt.type === 'ExportNamedDeclaration' &&
            !stmt.source &&
            !stmt.declaration &&
            stmt.specifiers.length === 0;
          if (emptyExport) continue;
          if (stmt.type === 'ExportAllDeclaration') {
            context.report({
              node: stmt,
              message: 'No `export *` from Kagaz — list each export explicitly (§A7.8 #3).',
            });
            continue;
          }
          if (
            stmt.type !== 'ExportNamedDeclaration' ||
            !stmt.source ||
            !/^@lokal-app\/kagaz-/.test(stmt.source.value)
          ) {
            context.report({
              node: stmt,
              message:
                "The gateway holds only `export { … } from '@lokal-app/kagaz-…'` lines — no code, JSX, styles or defaults (§A7.8 #2).",
            });
            continue;
          }
          for (const spec of stmt.specifiers) {
            const local = spec.local.name ?? spec.local.value;
            const exported = spec.exported.name ?? spec.exported.value;
            if (local !== exported) {
              context.report({
                node: spec,
                message: `No aliases in the gateway: export ${local} under its Kagaz name (§A7.8 #2).`,
              });
            }
          }
        }
      },
    };
  },
};
