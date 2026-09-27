// Constitution §A12 — ESLint as architecture enforcement. Changing any rule here = ADR.
import { defineConfig, globalIgnores } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import designSystem from 'eslint-plugin-design-system';
import i18next from 'eslint-plugin-i18next';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactNative from 'eslint-plugin-react-native';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const TS_FILES = ['**/*.ts', '**/*.tsx'];
const SRC_FILES = ['src/**/*.ts', 'src/**/*.tsx'];

function restrictedImports({ allowAxios = false, inFeature = false } = {}) {
  return [
    'error',
    {
      paths: [
        ...(allowAxios
          ? []
          : [
              {
                name: 'axios',
                message: 'axios lives only in src/lib/api-client (§A6.2) — use apiClient.',
              },
            ]),
        {
          name: 'react-native',
          importNames: ['FlatList', 'SectionList'],
          message: 'Use @shopify/flash-list for data lists (§A0/§A10).',
        },
        { name: 'react-native', importNames: ['Image'], message: 'Use expo-image (§A0/§A10).' },
        {
          name: 'react-native',
          importNames: ['SafeAreaView'],
          message: 'Use the ui <Screen> primitive / react-native-safe-area-context (§A0).',
        },
        {
          name: 'react-native',
          importNames: ['KeyboardAvoidingView'],
          message: 'Use react-native-keyboard-controller (§A0).',
        },
        {
          name: 'react-native',
          importNames: ['Animated', 'PanResponder'],
          message: 'Use react-native-reanimated / react-native-gesture-handler for new code (§A0).',
        },
        {
          name: '@react-native-community/netinfo',
          message: 'Connectivity is bound once via expo-network in lib/api-client (§A0).',
        },
      ],
      patterns: [
        {
          group: ['@react-native-async-storage/*'],
          message: 'AsyncStorage is forbidden — use storage (MMKV) from @/lib/storage (§A0).',
        },
        inFeature
          ? {
              group: ['@/features/*'],
              message:
                'features never import other features (§A3); use relative imports inside your own feature.',
            }
          : {
              group: ['@/features/*/*'],
              message: 'Import features only via their barrel: @/features/<name> (§A5).',
            },
      ],
    },
  ];
}

const layerZones = [
  {
    target: './src/theme',
    from: './src',
    except: ['./theme'],
    message: 'theme/ imports NOTHING from src/ (§A3).',
  },
  {
    target: './src/lib',
    from: [
      './src/api',
      './src/components',
      './src/screens',
      './src/stores',
      './src/hooks',
      './src/navigation',
      './src/providers',
      './src/features',
      './src/theme',
      './src/App.tsx',
    ],
    message:
      'lib/ never imports spine, features or theme (§A3). Cross into app state via registered callbacks.',
  },
  {
    target: './src/components/ui',
    from: './src',
    except: ['./components/ui', './theme', './utils'],
    message: 'components/ui imports only theme/ + utils/ + sibling primitives (§A3/§A7.1).',
  },
  {
    target: './src/components',
    from: ['./src/api', './src/stores', './src/screens'],
    message: 'Components never fetch or read stores — data arrives via props (§A3).',
  },
  {
    target: './src/hooks',
    from: ['./src/api', './src/stores', './src/screens', './src/components'],
    message: 'hooks/ never imports api/, stores/, screens/ or components/ (§A1/§A3).',
  },
  {
    target: './src/stores',
    from: ['./src/screens', './src/components', './src/api'],
    message: 'stores/ never imports screens/, components/ or api/ (§A3).',
  },
  {
    target: './src/api',
    from: ['./src/components', './src/screens', './src/stores'],
    message: 'api/ never imports components/, screens/ or stores/ (§A3).',
  },
  {
    target: './src/features',
    from: ['./src/stores', './src/screens'],
    message: 'features never import spine stores/ or screens/ (§A1 4-of-4 #3, §A3).',
  },
];

export default defineConfig([
  globalIgnores([
    'node_modules/**',
    'android/**',
    'ios/**',
    '.expo/**',
    'dist/**',
    'coverage/**',
    '.code-review-graph/**',
    'expo-env.d.ts',
  ]),

  ...expoConfig,

  {
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json', alwaysTryTypes: true },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'] },
      },
    },
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/no-default-export': 'error',
      'import/no-cycle': ['error', { maxDepth: Infinity }],
      'max-lines-per-function': ['error', { max: 120, skipBlankLines: true, skipComments: true }],
    },
  },

  {
    files: TS_FILES,
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description', 'ts-ignore': true, 'ts-nocheck': true },
      ],
    },
  },

  {
    files: SRC_FILES,
    plugins: {
      'react-compiler': reactCompiler,
      'react-native': reactNative,
      i18next,
      'design-system': designSystem,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
      'no-console': 'error',
      'react-native/no-inline-styles': 'error',
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          'jsx-attributes': {
            include: [
              'accessibilityLabel',
              'accessibilityHint',
              'placeholder',
              'title',
              'label',
              'message',
              'description',
              'helperText',
              'error',
            ],
          },
        },
      ],
      'no-restricted-imports': restrictedImports(),
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportSpecifier[imported.name=/^Api(?!Error$)[A-Z]/]',
          message: 'Api* wire types never leave src/api/** — import the clean app type (§A6.2 #3).',
        },
      ],
      'import/no-restricted-paths': ['error', { zones: layerZones }],
      'design-system/no-raw-colors': ['error', { paletteFile: 'src/theme/tokens/palette.ts' }],
      'design-system/spacing-scale-only': ['error', { spacingFile: 'src/theme/tokens/spacing.ts' }],
      'design-system/typography-component-only': [
        'error',
        { allowTextImport: ['src/components/ui/Typography.tsx'] },
      ],
      'design-system/styles-pattern': 'error',
      'design-system/tokens-only': 'error',
      'design-system/no-tokens-outside-theme': 'error',
      'design-system/no-layer-root-barrels': 'error',
    },
  },

  // §A10 #8 file-length limits.
  {
    files: ['src/**/*.tsx'],
    rules: { 'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ['src/**/use*.ts'],
    rules: { 'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }] },
  },

  // utils/ imports nothing from src/ except types (§A3).
  {
    files: ['src/utils/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*', '!@/utils', '!@/utils/*'],
              allowTypeImports: true,
              message: 'utils/ imports nothing from src/ except types (§A3).',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/lib/api-client/**/*.ts'],
    rules: { 'no-restricted-imports': restrictedImports({ allowAxios: true }) },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrictedImports({ inFeature: true }) },
  },
  { files: ['src/api/**/*.ts'], rules: { 'no-restricted-syntax': 'off' } },
  // lib/logger IS the sanctioned console sink that every other file must use (§A10 #3).
  { files: ['src/lib/logger/**/*.ts'], rules: { 'no-console': 'off' } },

  // Config files that require a default export (§A10 #1).
  {
    files: ['app.config.ts', 'eslint.config.mjs', '*.config.{js,mjs,cjs,ts}', '.prettierrc.js'],
    rules: { 'import/no-default-export': 'off' },
  },
  {
    files: ['eslint-plugin-design-system/**/*.js', 'scripts/**/*.js'],
    languageOptions: { sourceType: 'commonjs' },
  },

  prettierRecommended,
]);
