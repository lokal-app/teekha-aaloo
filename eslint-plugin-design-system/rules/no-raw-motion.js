// Animation timing comes from tokens.motion.* (§A7.3) — neither token tier covers motion.
const ANIMATORS = new Set(['withTiming', 'withSpring', 'withDecay', 'timing', 'spring']);

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Durations and easings come from tokens.motion.* (§A7.3)' },
    schema: [],
  },
  create(context) {
    function calleeName(node) {
      if (node.callee.type === 'Identifier') return node.callee.name;
      if (node.callee.type === 'MemberExpression' && !node.callee.computed)
        return node.callee.property.name;
      return null;
    }
    return {
      CallExpression(node) {
        const name = calleeName(node);
        if (
          name === 'bezier' &&
          node.arguments.length &&
          node.arguments.every((a) => a.type === 'Literal')
        ) {
          context.report({
            node,
            message:
              'Literal easing — use Easing.bezier(...tokens.motion.easing.standard|emphasized).',
          });
          return;
        }
        if (!ANIMATORS.has(name)) return;
        for (const arg of node.arguments) {
          if (arg.type !== 'ObjectExpression') continue;
          for (const prop of arg.properties) {
            if (
              prop.type === 'Property' &&
              !prop.computed &&
              prop.key.type === 'Identifier' &&
              prop.key.name === 'duration' &&
              prop.value.type === 'Literal' &&
              typeof prop.value.value === 'number'
            ) {
              context.report({
                node: prop,
                message: `Literal duration ${prop.value.value} — use tokens.motion.duration.fast|normal|slow.`,
              });
            }
          }
        }
      },
    };
  },
};
