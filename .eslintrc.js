module.exports = {
  env: {
    browser: true,
  },
  extends: ["eslint:recommended", "plugin:vue/recommended"],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 11,
    sourceType: "module",
  },
  plugins: ["vue"],
  rules: {
    "no-console": 1,
  },
};
