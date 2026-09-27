module.exports = {
  '*.{ts,tsx,js,mjs}': ['eslint --max-warnings=0 --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.{ts,tsx}': () => 'tsc --noEmit',
};
