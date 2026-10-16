const path = require('node:path');

const { relativeFile } = require('../utils');

// §A5 whitelist (+ §A6.4: a feature's internal screens/stores reuse the spine shapes).
const WHITELIST = [
  /^src\/features\/[^/]+\/index\.tsx?$/,
  /^src\/lib\/[^/]+\/index\.ts$/,
  /^src\/theme\/index\.ts$/,
  /^src\/components\/ui\/index\.ts$/,
  /^src\/components\/shell\/index\.ts$/,
  /^src\/components\/icons\/index\.ts$/,
  /^src\/screens\/[^/]+\/[^/]+\/index\.ts$/,
  /^src\/stores\/[^/]+\/index\.ts$/,
  /^src\/features\/[^/]+\/screens\/(?:[^/]+\/)?[^/]+\/index\.ts$/,
  /^src\/features\/[^/]+\/stores\/(?:[^/]+\/)?index\.ts$/,
  // §A2: providers/index.tsx is the composition root itself, not a barrel.
  /^src\/providers\/index\.tsx$/,
];

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'index.ts barrels only at §A5 whitelisted module boundaries' },
    schema: [],
    messages: {
      barrel:
        "'{{file}}' is not a whitelisted barrel. index.ts is allowed only at features/<x>/, lib/<slot>/, theme/, components/ui/, components/shell/, components/icons/, screens/<area>/<screen>/, stores/<area>/ (§A5).",
      kagazReexport:
        'Re-exporting Kagaz is allowed only in src/components/ui/ (components) and src/theme/ (theme API, brand binding) — §A5/§A7.8.',
    },
  },
  create(context) {
    const file = relativeFile(context);
    if (!file.startsWith('src/')) return {};
    const kagazAllowed = file.startsWith('src/components/ui/') || file.startsWith('src/theme/');
    const visitors = {};
    if (!kagazAllowed) {
      const check = (node) => {
        if (node.source && /^@lokal-app\/kagaz-/.test(node.source.value)) {
          context.report({ node, messageId: 'kagazReexport' });
        }
      };
      visitors.ExportNamedDeclaration = check;
      visitors.ExportAllDeclaration = check;
    }
    const isIndex = /^index\.(ts|tsx|js|jsx)$/.test(path.basename(file));
    if (isIndex && !WHITELIST.some((re) => re.test(file))) {
      visitors.Program = (node) => context.report({ node, messageId: 'barrel', data: { file } });
    }
    return visitors;
  },
};
