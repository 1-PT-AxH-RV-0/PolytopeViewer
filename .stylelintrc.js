module.exports = {
  ignoreFiles: ['dist/**'],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-recess-order'
  ],
  plugins: ['stylelint-order']
};
