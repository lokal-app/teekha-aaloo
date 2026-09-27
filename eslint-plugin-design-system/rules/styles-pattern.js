const path = require('node:path');

const { relativeFile } = require('../utils');

// A file directly inside a screen folder: screens/<area>/<screen>/<file> (spine or feature).
const SCREEN_FOLDER_FILE = /^src\/(?:features\/[^/]+\/)?screens\/[^/]+\/[^/]+\/[^/]+\.tsx?$/;

function isStyleSheetCreate(node) {
  return (
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'StyleSheet' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'create'
  );
}

function enclosingFunction(node) {
  let cur = node.parent;
  while (cur) {
    if (
      cur.type === 'ArrowFunctionExpression' ||
      cur.type === 'FunctionExpression' ||
      cur.type === 'FunctionDeclaration'
    ) {
      return cur;
    }
    cur = cur.parent;
  }
  return null;
}

function isReturnedDirectly(call, fn) {
  if (call.parent === fn) return true; // arrow expression body
  return call.parent.type === 'ReturnStatement' && enclosingFunction(call.parent) === fn;
}

function factoryName(fn) {
  if (fn.type === 'FunctionDeclaration') return fn.id && fn.id.name;
  if (fn.parent.type === 'VariableDeclarator' && fn.parent.id.type === 'Identifier') {
    return fn.parent.id.name;
  }
  return null;
}

function topLevelStatement(node) {
  let cur = node;
  while (cur.parent && cur.parent.type !== 'Program') cur = cur.parent;
  return cur;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'StyleSheet.create lives only inside a createStyles(theme[, params]) factory — in-file tail for components, styles.ts for screens (§A7)',
    },
    schema: [],
    messages: {
      notInFactory:
        'StyleSheet.create must be returned directly by `const createStyles = (theme: Theme[, params]) => StyleSheet.create({…})`.',
      firstParam: "createStyles' first parameter must be `theme`.",
      notLast: 'createStyles must be the LAST declaration in a component file.',
      screenStylesFile:
        "Screen styles belong in the screen folder's styles.ts (export createStyles only), not in {{file}}.",
      stylesFileExports:
        'A screen styles.ts exports createStyles and NOTHING else (constants → constants.ts).',
      stylesFileMissing: 'A screen styles.ts must export createStyles.',
    },
  },
  create(context) {
    const file = relativeFile(context);
    const base = path.basename(file);
    const inScreenFolder = SCREEN_FOLDER_FILE.test(file);
    const isScreenStylesFile = inScreenFolder && base === 'styles.ts';

    return {
      CallExpression(node) {
        if (!isStyleSheetCreate(node)) return;
        const fn = enclosingFunction(node);
        if (!fn || !isReturnedDirectly(node, fn) || factoryName(fn) !== 'createStyles') {
          context.report({ node, messageId: 'notInFactory' });
          return;
        }
        const first = fn.params[0];
        if (!first || first.type !== 'Identifier' || !/^_?theme$/.test(first.name)) {
          context.report({ node: first ?? fn, messageId: 'firstParam' });
        }
        if (inScreenFolder && !isScreenStylesFile) {
          context.report({ node, messageId: 'screenStylesFile', data: { file: base } });
          return;
        }
        if (!isScreenStylesFile) {
          const program = context.sourceCode.ast;
          const stmt = topLevelStatement(fn);
          if (program.body[program.body.length - 1] !== stmt) {
            context.report({ node: stmt, messageId: 'notLast' });
          }
        }
      },
      'Program:exit'(program) {
        if (!isScreenStylesFile) return;
        let hasCreateStyles = false;
        for (const stmt of program.body) {
          if (stmt.type === 'ExportDefaultDeclaration' || stmt.type === 'ExportAllDeclaration') {
            context.report({ node: stmt, messageId: 'stylesFileExports' });
          } else if (stmt.type === 'ExportNamedDeclaration') {
            const names = [];
            if (stmt.declaration) {
              if (stmt.declaration.type === 'VariableDeclaration') {
                for (const d of stmt.declaration.declarations) names.push(d.id.name);
              } else if (stmt.declaration.id) {
                names.push(stmt.declaration.id.name);
              }
            }
            for (const s of stmt.specifiers) names.push(s.exported.name);
            for (const n of names) {
              if (n === 'createStyles') hasCreateStyles = true;
              else context.report({ node: stmt, messageId: 'stylesFileExports' });
            }
          }
        }
        if (!hasCreateStyles) context.report({ node: program, messageId: 'stylesFileMissing' });
      },
    };
  },
};
