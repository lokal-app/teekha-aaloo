const { isInTheme, readSpacingScale, propertyName, numericValue } = require('../utils');

const SPACING_PROP =
  /^(?:(?:padding|margin)(?:Top|Bottom|Left|Right|Horizontal|Vertical|Start|End|Block|BlockStart|BlockEnd|Inline|InlineStart|InlineEnd)?|gap|rowGap|columnGap|top|bottom|left|right|start|end|inset|insetBlock|insetInline)$/;

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Numeric padding/margin/gap/inset values must be on the spacing scale (§A7)',
    },
    schema: [
      {
        type: 'object',
        properties: { spacingFile: { type: 'string' } },
        additionalProperties: false,
      },
    ],
    messages: {
      offScale:
        "'{{prop}}: {{value}}' is not on the spacing scale — use theme.spacing.* (none|xxs|xs|sm|md|lg|xl|xxl|xxxl).",
    },
  },
  create(context) {
    if (isInTheme(context)) return {};
    const spacingFile = (context.options[0] ?? {}).spacingFile ?? 'src/theme/tokens/spacing.ts';
    const scale = readSpacingScale(context, spacingFile) ?? new Set([0]);

    return {
      Property(node) {
        const prop = propertyName(node);
        if (!prop || !SPACING_PROP.test(prop)) return;
        const value = numericValue(node.value);
        if (value === null || scale.has(Math.abs(value))) return;
        context.report({
          node: node.value,
          messageId: 'offScale',
          data: { prop, value: String(value) },
        });
      },
    };
  },
};
