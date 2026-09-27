const { isInTheme, relativeFile, propertyName } = require('../utils');

const FONT_ATTRS = new Set(['fontSize', 'fontWeight', 'fontFamily']);
const FONT_STYLE_PROPS = new Set([
  'fontSize',
  'fontWeight',
  'fontFamily',
  'lineHeight',
  'letterSpacing',
]);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Text renders only via <Typography variant>; no raw font props/values (§A7)',
    },
    schema: [
      {
        type: 'object',
        properties: { allowTextImport: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
      },
    ],
    messages: {
      textFontProp: '<Text {{attr}}> is forbidden — render text with <Typography variant="…">.',
      textImport:
        'Importing Text from \'react-native\' is forbidden here — render text with <Typography variant="…"> from @/components/ui.',
      rawFontValue: "Raw '{{prop}}' value — typography comes only from theme.typography.<variant>.",
    },
  },
  create(context) {
    const allowTextImport = (context.options[0] ?? {}).allowTextImport ?? [
      'src/components/ui/Typography.tsx',
    ];
    const file = relativeFile(context);
    const inTheme = isInTheme(context);

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'react-native' || allowTextImport.includes(file)) return;
        for (const spec of node.specifiers) {
          if (spec.type === 'ImportSpecifier' && spec.imported.name === 'Text') {
            context.report({ node: spec, messageId: 'textImport' });
          }
        }
      },
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'Text') return;
        for (const attr of node.attributes) {
          if (attr.type === 'JSXAttribute' && FONT_ATTRS.has(attr.name.name)) {
            context.report({
              node: attr,
              messageId: 'textFontProp',
              data: { attr: attr.name.name },
            });
          }
        }
      },
      Property(node) {
        if (inTheme) return;
        const prop = propertyName(node);
        if (!prop || !FONT_STYLE_PROPS.has(prop)) return;
        const v = node.value;
        const isRaw =
          (v.type === 'Literal' && (typeof v.value === 'number' || typeof v.value === 'string')) ||
          (v.type === 'UnaryExpression' && v.argument.type === 'Literal');
        if (isRaw) context.report({ node: v, messageId: 'rawFontValue', data: { prop } });
      },
    };
  },
};
