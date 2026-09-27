const { isInTheme } = require('../utils');

const TOKEN_NAMES = new Set([
  'colors',
  'palette',
  'spacing',
  'typography',
  'radius',
  'radii',
  'shadows',
  'fonts',
  'fontSizes',
  'fontWeights',
  'lightColors',
  'darkColors',
]);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Color/spacing/typography/radius/shadow constants may only be imported from @/theme (§A7)',
    },
    schema: [],
    messages: {
      foreign:
        "'{{name}}' imported from '{{source}}' — design constants come only from @/theme (via the theme object / useStyles).",
    },
  },
  create(context) {
    if (isInTheme(context)) return {};
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source === '@/theme') return;
        for (const spec of node.specifiers) {
          const name =
            spec.type === 'ImportSpecifier' ? spec.imported.name : spec.local && spec.local.name;
          if (name && TOKEN_NAMES.has(name)) {
            context.report({ node: spec, messageId: 'foreign', data: { name, source } });
          }
        }
      },
    };
  },
};
