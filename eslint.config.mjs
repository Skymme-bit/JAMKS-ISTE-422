// eslint.config.mjs
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config([
  ...tseslint.configs.recommended, // recommended config first
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
]);