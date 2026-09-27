const { relativeFile, readPalette, nearestPaletteToken } = require('../utils');

const COLOR_RE =
  /^(#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:rgba?|hsla?)\s*\(.*\))$/i;

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid raw hex/rgb/hsl color values outside theme/tokens/palette.ts (§A7)',
    },
    schema: [
      {
        type: 'object',
        properties: {
          paletteFile: { type: 'string' },
          allow: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      raw: "Raw color '{{value}}' — colors come ONLY from theme.colors.* (semantic tokens).{{hint}}",
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const paletteFile = options.paletteFile ?? 'src/theme/tokens/palette.ts';
    const allow = options.allow ?? [paletteFile];
    if (allow.includes(relativeFile(context))) return {};

    function check(node, value) {
      const trimmed = value.trim();
      if (!COLOR_RE.test(trimmed)) return;
      const nearest = nearestPaletteToken(trimmed, readPalette(context, paletteFile));
      const hint = nearest
        ? ` Nearest palette value: ${nearest.name} (${nearest.hex}) — expose it via a semantic key in themes/, never import palette.`
        : '';
      context.report({ node, messageId: 'raw', data: { value: trimmed, hint } });
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node, node.value);
      },
      TemplateLiteral(node) {
        if (node.expressions.length === 0) check(node, node.quasis[0].value.cooked ?? '');
      },
    };
  },
};
