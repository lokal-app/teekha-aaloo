// `style` on a Kagaz element (imported from @/components/ui) is layout-only (§A7.3).
const fs = require('node:fs');
const path = require('node:path');
const { gatewayImports, kagazExportNames, propertyName } = require('../utils');

const LAYOUT =
  /^(margin\w*|flex\w*|align\w*|justify\w*|position|top|right|bottom|left|start|end|inset\w*|width|height|min\w*|max\w*|zIndex|aspectRatio|display|overflow|transform)$/;
const TEXT_EXTRA = new Set(['textAlign', 'textAlignVertical', 'writingDirection']);

/** createStyles keys → the property names of their style objects, for one source file. */
function stylesIndex(ast) {
  const index = new Map();
  const visit = (node) => {
    if (!node || typeof node.type !== 'string') return;
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object.name === 'StyleSheet' &&
      node.callee.property.name === 'create' &&
      node.arguments[0]?.type === 'ObjectExpression'
    ) {
      for (const entry of node.arguments[0].properties) {
        const key = propertyName(entry);
        if (key && entry.value.type === 'ObjectExpression') {
          index.set(
            key,
            entry.value.properties
              .map((p) => ({ name: propertyName(p), node: p }))
              .filter((p) => p.name),
          );
        }
      }
      return;
    }
    for (const k of Object.keys(node)) {
      if (k === 'parent') continue;
      const v = node[k];
      if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v === 'object' && typeof v.type === 'string') visit(v);
    }
  };
  visit(ast);
  return index;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: "A Kagaz element's style prop holds layout keys only (§A7.3)" },
    schema: [],
  },
  create(context) {
    const kagaz = kagazExportNames(context);
    let imports = new Map();
    let local = null;
    let sibling = null;
    const siblingIndex = () => {
      if (sibling) return sibling;
      sibling = new Map();
      const file = path.join(path.dirname(context.filename), 'styles.ts');
      if (!fs.existsSync(file)) return sibling;
      const parser = context.languageOptions?.parser;
      if (!parser?.parseForESLint && !parser?.parse) return sibling;
      const code = fs.readFileSync(file, 'utf8');
      const opts = {
        ecmaVersion: 'latest',
        sourceType: 'module',
        range: true,
        loc: true,
        filePath: file,
      };
      const ast = parser.parseForESLint
        ? parser.parseForESLint(code, opts).ast
        : parser.parse(code, opts);
      sibling = stylesIndex(ast);
      return sibling;
    };
    function checkStyleRef(expr, component, reportAt) {
      if (!expr) return;
      if (expr.type === 'ArrayExpression')
        return expr.elements.forEach((e) => checkStyleRef(e, component, reportAt));
      if (expr.type === 'LogicalExpression') return checkStyleRef(expr.right, component, reportAt);
      if (expr.type === 'ConditionalExpression') {
        checkStyleRef(expr.consequent, component, reportAt);
        return checkStyleRef(expr.alternate, component, reportAt);
      }
      if (expr.type !== 'MemberExpression' || expr.computed || expr.property.type !== 'Identifier')
        return;
      const key = expr.property.name;
      const props = local.get(key) ?? siblingIndex().get(key) ?? [];
      for (const p of props) {
        const ok = LAYOUT.test(p.name) || (component === 'Text' && TEXT_EXTRA.has(p.name));
        if (!ok) {
          context.report({
            node: reportAt,
            message: `"${p.name}" in styles.${key} is visual — a Kagaz <${component}>'s style is layout-only; change its look via props, the theme or the Kagaz gap protocol (§A7.3).`,
          });
        }
      }
    }
    return {
      Program(node) {
        imports = gatewayImports(node);
        local = stylesIndex(node);
      },
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier') return;
        const imported = imports.get(node.name.name);
        if (!imported || !kagaz.has(imported)) return;
        const style = node.attributes.find(
          (a) => a.type === 'JSXAttribute' && a.name.name === 'style',
        );
        if (style?.value?.type === 'JSXExpressionContainer')
          checkStyleRef(style.value.expression, imported, style);
      },
    };
  },
};
