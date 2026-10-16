const rules = {
  'no-raw-style-values': require('./rules/no-raw-style-values'),
  'no-raw-motion': require('./rules/no-raw-motion'),
  'styles-pattern': require('./rules/styles-pattern'),
  'kagaz-style-layout-only': require('./rules/kagaz-style-layout-only'),
  'no-shadowed-kagaz-components': require('./rules/no-shadowed-kagaz-components'),
  'kagaz-i18n-props': require('./rules/kagaz-i18n-props'),
  'locked-folders': require('./rules/locked-folders'),
  'no-layer-root-barrels': require('./rules/no-layer-root-barrels'),
  'kagaz-gap-ledger': require('./rules/kagaz-gap-ledger'),
  'kagaz-gateway-pass-through': require('./rules/kagaz-gateway-pass-through'),
};

const plugin = { meta: { name: 'eslint-plugin-design-system', version: '2.0.0' }, rules };
plugin.configs = {
  recommended: {
    plugins: { 'design-system': plugin },
    rules: Object.fromEntries(Object.keys(rules).map((name) => [`design-system/${name}`, 'error'])),
  },
};
module.exports = plugin;
