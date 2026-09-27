const noRawColors = require('./rules/no-raw-colors');
const spacingScaleOnly = require('./rules/spacing-scale-only');
const typographyComponentOnly = require('./rules/typography-component-only');
const stylesPattern = require('./rules/styles-pattern');
const tokensOnly = require('./rules/tokens-only');
const noTokensOutsideTheme = require('./rules/no-tokens-outside-theme');
const noLayerRootBarrels = require('./rules/no-layer-root-barrels');

const plugin = {
  meta: { name: 'eslint-plugin-design-system', version: '1.0.0' },
  rules: {
    'no-raw-colors': noRawColors,
    'spacing-scale-only': spacingScaleOnly,
    'typography-component-only': typographyComponentOnly,
    'styles-pattern': stylesPattern,
    'tokens-only': tokensOnly,
    'no-tokens-outside-theme': noTokensOutsideTheme,
    'no-layer-root-barrels': noLayerRootBarrels,
  },
};

plugin.configs = {
  recommended: {
    plugins: { 'design-system': plugin },
    rules: Object.fromEntries(
      Object.keys(plugin.rules).map((name) => [`design-system/${name}`, 'error']),
    ),
  },
};

module.exports = plugin;
