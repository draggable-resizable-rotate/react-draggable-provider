module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    // 接入 prettier 适配
    'prettier'
  ],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },
  // 自定义 rules
  rules: {
    'no-console': 'error',
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'jsx-quotes': ['error', 'prefer-double'],
  },
};
