const path = require('node:path');

const { relativeFile } = require('../utils');

// §A5 whitelist (+ §A6.4: a feature's internal screens/stores reuse the spine shapes).
const WHITELIST = [
  /^src\/features\/[^/]+\/index\.tsx?$/,
  /^src\/lib\/[^/]+\/index\.ts$/,
  /^src\/theme\/index\.ts$/,
  /^src\/components\/ui\/index\.ts$/,
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
        "'{{file}}' is not a whitelisted barrel. index.ts is allowed only at features/<x>/, lib/<slot>/, theme/, components/ui/, screens/<area>/<screen>/, stores/<area>/ (§A5).",
    },
  },
  create(context) {
    const file = relativeFile(context);
    if (!file.startsWith('src/') || !/^index\.(ts|tsx|js|jsx)$/.test(path.basename(file)))
      return {};
    if (WHITELIST.some((re) => re.test(file))) return {};
    return {
      Program(node) {
        context.report({ node, messageId: 'barrel', data: { file } });
      },
    };
  },
};
