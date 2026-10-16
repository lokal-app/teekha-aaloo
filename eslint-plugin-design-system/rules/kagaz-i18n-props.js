// Kagaz props with English defaults must be passed explicitly (translated) — §A7.6.
const { gatewayImports, readProjectFile } = require('../utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Pass every Kagaz text/a11y prop that has an English default (via t())' },
    schema: [],
  },
  create(context) {
    const raw = readProjectFile(context, 'eslint-plugin-design-system/kagaz-i18n-props.json');
    const table = raw ? (JSON.parse(raw).components ?? {}) : {};
    let imports = new Map();
    return {
      Program(node) {
        imports = gatewayImports(node);
      },
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier') return;
        const imported = imports.get(node.name.name);
        const rules = imported && table[imported];
        if (!rules) return;
        const attrs = new Set(
          node.attributes.filter((a) => a.type === 'JSXAttribute').map((a) => a.name.name),
        );
        if (node.attributes.some((a) => a.type === 'JSXSpreadAttribute')) return; // can't see through spreads
        for (const { prop, when, default: def } of rules) {
          if (when && !attrs.has(when)) continue;
          if (!attrs.has(prop)) {
            context.report({
              node,
              message: `<${imported}> renders "${prop}" with an English default (${def}) — pass ${prop}={t('…')} (§A7.6).`,
            });
          }
        }
      },
    };
  },
};
