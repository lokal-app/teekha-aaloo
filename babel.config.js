module.exports = function (api) {
  api.cache(true);
  return {
    // Worklets plugin is registered explicitly below (must stay last), so the preset's auto-add is off.
    presets: [['babel-preset-expo', { worklets: false }]],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.js',
            '.json',
          ],
          alias: {
            '@': './src',
            '@env': './src/lib/env.ts',
            '@assets': './assets',
            '@modules': './modules',
          },
        },
      ],
      'react-native-worklets/plugin',
    ],
  };
};
