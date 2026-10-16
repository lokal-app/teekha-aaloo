// No app component may take a Kagaz export's name (§A4), except gateway adapters (§A7.8).
const { kagazExportNames, relativeFile } = require('../utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Component names never equal a Kagaz export (shared or brand)' },
    schema: [],
  },
  create(context) {
    const file = relativeFile(context);
    if (!file.startsWith('src/') || file.startsWith('src/components/ui/adapters/')) return {};
    const kagaz = kagazExportNames(context);
    const check = (id) => {
      if (id && /^[A-Z]/.test(id.name) && kagaz.has(id.name)) {
        context.report({
          node: id,
          message: `"${id.name}" is a Kagaz export — import it from @/components/ui instead of declaring your own, or pick a business name (e.g. BookingCard).`,
        });
      }
    };
    return {
      'Program > FunctionDeclaration'(node) {
        check(node.id);
      },
      'Program > ExportNamedDeclaration > FunctionDeclaration'(node) {
        check(node.id);
      },
      'Program > VariableDeclaration > VariableDeclarator'(node) {
        if (node.id.type === 'Identifier') check(node.id);
      },
      'Program > ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'(node) {
        if (node.id.type === 'Identifier') check(node.id);
      },
    };
  },
};
