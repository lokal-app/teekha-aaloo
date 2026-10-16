// Locked folder shapes (§A7.2 theme, §A7.5 shell, §A7.8 ui gateway; no theme/tokens).
const { relativeFile } = require('../utils');

const SHAPES = [
  {
    dir: 'src/theme/tokens/',
    allow: [],
    why: 'there are no local tokens — Kagaz owns every token (§A7.1)',
  },
  {
    dir: 'src/components/ui/',
    allow: [/^(kagaz|brand|navigation|index)\.ts$/, /^adapters\/[A-Z]\w*\.tsx$/],
    why: 'the Kagaz gateway has a locked shape (§A7.8)',
  },
  {
    dir: 'src/components/shell/',
    allow: [
      /^(Screen|LoadingState|ErrorState|EmptyState|ToastMessage)\.tsx$/,
      /^index\.ts$/,
      /^BottomSheet\/BottomSheet\.tsx$/,
    ],
    why: 'components/shell is a closed list of six (§A7.5)',
  },
  {
    dir: 'src/theme/',
    allow: [
      /^(brand|overrides|mergeOverrides|registry|navigationTheme|useStyles|index)\.ts$/,
      /^skins\/[a-z][\w-]*\.ts$/,
    ],
    why: 'src/theme has a locked shape (§A7.2)',
  },
];

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Files only where the locked folder shapes allow them' },
    schema: [],
  },
  create(context) {
    const file = relativeFile(context);
    const shape = SHAPES.find((s) => file.startsWith(s.dir));
    if (!shape) return {};
    const rest = file.slice(shape.dir.length);
    if (shape.allow.some((re) => re.test(rest))) return {};
    return {
      Program(node) {
        context.report({ node, message: `${file}: ${shape.why}.` });
      },
    };
  },
};
