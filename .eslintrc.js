module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'next',
    // 'plugin:testing-library/react',
    // 'plugin:jest-dom/recommended',
  ],
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['src', './src']
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  rules: {
    // Add your project-specific rules here
    // "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
};