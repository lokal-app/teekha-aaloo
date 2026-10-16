// Every KAGAZ-GAP composition and KAGAZ-ADAPTER has its row in docs/kagaz-gaps.md (§A7.7, §A7.8).
const { readProjectFile, relativeFile } = require('../utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'KAGAZ-GAP / KAGAZ-ADAPTER markers need a ledger row' },
    schema: [],
  },
  create(context) {
    if (!relativeFile(context).startsWith('src/')) return {};
    return {
      Program(node) {
        const first = context.sourceCode.getAllComments()[0];
        if (!first || first.loc.start.line !== 1) return;
        const gap = /KAGAZ-GAP\((\S+?)\)/.exec(first.value);
        if (!gap) return;
        const ledger = readProjectFile(context, 'docs/kagaz-gaps.md') ?? '';
        if (!ledger.includes(gap[1])) {
          context.report({
            node,
            message: `KAGAZ-GAP ${gap[1]} has no row in docs/kagaz-gaps.md (§A7.7).`,
          });
        }
      },
    };
  },
};
