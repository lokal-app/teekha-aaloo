const path = require('node:path');

const { isInTheme, toPosix } = require('../utils');

function importsTokens(context, source) {
  if (/(^|\/)theme\/tokens(\/|$)/.test(source)) return true;
  if (source.startsWith('.')) {
    const resolved = toPosix(path.resolve(path.dirname(context.filename), source));
    return /\/src\/theme\/tokens(\/|$)/.test(resolved);
  }
  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'theme/tokens/* is theme-internal — never imported outside src/theme/ (§A7)',
    },
    schema: [],
    messages: {
      internal:
        "'{{source}}' is theme-internal. Consume tokens through the theme object (useStyles/useTheme from @/theme).",
    },
  },
  create(context) {
    if (isInTheme(context)) return {};
    function check(node, source) {
      if (typeof source === 'string' && importsTokens(context, source)) {
        context.report({ node, messageId: 'internal', data: { source } });
      }
    }
    return {
      ImportDeclaration(node) {
        check(node, node.source.value);
      },
      ExportNamedDeclaration(node) {
        if (node.source) check(node, node.source.value);
      },
      ExportAllDeclaration(node) {
        check(node, node.source.value);
      },
      ImportExpression(node) {
        if (node.source.type === 'Literal') check(node, node.source.value);
      },
    };
  },
};
