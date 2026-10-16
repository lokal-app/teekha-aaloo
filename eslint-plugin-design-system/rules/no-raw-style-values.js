// The DEFAULT token-value rule (§A12). Same value table as Kagaz's token-police
// `no-hardcoded-style-value`, so switching to token-police changes nothing for valid code.
// Turned off in eslint.config.mjs when USE_TOKEN_POLICE is true.
const { relativeFile } = require('../utils');

const COLOR_KEYS = new Map([
  ['color', 'tokens.color.text.*'],
  ['backgroundColor', 'tokens.color.surface.*'],
  ['borderColor', 'tokens.color.border.*'],
  ['borderTopColor', 'tokens.color.border.*'],
  ['borderBottomColor', 'tokens.color.border.*'],
  ['borderLeftColor', 'tokens.color.border.*'],
  ['borderRightColor', 'tokens.color.border.*'],
  ['borderStartColor', 'tokens.color.border.*'],
  ['borderEndColor', 'tokens.color.border.*'],
  ['outlineColor', 'tokens.color.border.*'],
  ['tintColor', 'tokens.color.icon.*'],
  ['textDecorationColor', 'tokens.color.text.*'],
  ['shadowColor', 'tokens.component.card.elevation'],
]);
const SHADOW_KEYS = new Set(['boxShadow', 'shadowOpacity', 'shadowRadius', 'elevation']);
const SPACING = [
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingEnd',
  'paddingVertical',
  'paddingHorizontal',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginEnd',
  'marginVertical',
  'marginHorizontal',
  'gap',
  'rowGap',
  'columnGap',
];
const DIMENSION_KEYS = new Map([
  ...SPACING.map((k) => [k, 'tokens.spacing[n]']),
  ...[
    'borderRadius',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
  ].map((k) => [k, 'tokens.cornerRadius.*']),
  ...[
    'borderWidth',
    'borderTopWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderRightWidth',
  ].map((k) => [k, 'tokens.borderWidth.*']),
  ...['fontSize', 'lineHeight', 'letterSpacing'].map((k) => [k, '<Text variant>']),
]);
const ALLOWED_COLOR_KEYWORDS = new Set(['transparent', 'currentcolor', 'inherit']);
const EXEMPT = [/^src\/theme\/overrides\.ts$/, /^src\/theme\/skins\//];

function literalNumber(node) {
  if (node.type === 'Literal' && typeof node.value === 'number') return node.value;
  if (
    node.type === 'UnaryExpression' &&
    node.operator === '-' &&
    node.argument.type === 'Literal' &&
    typeof node.argument.value === 'number'
  )
    return -node.argument.value;
  return null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'No literal colour/spacing/radius/border/type/opacity/shadow values (§A7.3)',
    },
    schema: [],
  },
  create(context) {
    const file = relativeFile(context);
    if (EXEMPT.some((re) => re.test(file))) return {};
    const report = (node, message) => context.report({ node, message });
    return {
      Property(node) {
        if (node.computed) return;
        const key =
          node.key.type === 'Identifier'
            ? node.key.name
            : node.key.type === 'Literal'
              ? String(node.key.value)
              : null;
        if (!key) return;
        const value = node.value;
        if (COLOR_KEYS.has(key)) {
          if (
            value.type === 'Literal' &&
            typeof value.value === 'string' &&
            !ALLOWED_COLOR_KEYWORDS.has(value.value.trim().toLowerCase())
          ) {
            report(
              node,
              `Hardcoded colour "${value.value}" for "${key}" — use ${COLOR_KEYS.get(key)} via useTokens()/useStyles.`,
            );
          }
          return;
        }
        if (SHADOW_KEYS.has(key)) {
          const str =
            value.type === 'Literal' &&
            typeof value.value === 'string' &&
            !['none', 'transparent'].includes(value.value.trim());
          const num = literalNumber(value);
          if (str || (num !== null && num !== 0)) {
            report(
              node,
              `Hardcoded shadow for "${key}" — use boxShadow: tokens.component.card.elevation (or a Kagaz component's \`elevated\` prop).`,
            );
          }
          return;
        }
        if (DIMENSION_KEYS.has(key)) {
          const num = literalNumber(value);
          if (num !== null && num !== 0)
            report(node, `Hardcoded ${key}: ${num} — use ${DIMENSION_KEYS.get(key)}.`);
          return;
        }
        if ((key === 'fontWeight' || key === 'fontFamily') && value.type === 'Literal') {
          report(
            node,
            `Hardcoded ${key} — type comes from <Text variant="…"> (Kagaz typography tokens).`,
          );
          return;
        }
        if (key === 'opacity') {
          const num = literalNumber(value);
          if (num !== null && num !== 0 && num !== 1) {
            report(
              node,
              `Hardcoded opacity ${num} — use tokens.opacity.disabled or a …disabled / …Opacity / alpha colour token.`,
            );
          }
        }
      },
    };
  },
};
