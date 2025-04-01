import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
// import jest from "eslint-plugin-jest";

export default defineConfig([
  {
    ignores: ["dist/"],
  },
  {
    files: [
      "cli/*.{js,mjs,cjs,ts}",
      "aws/*.{js,mjs,cjs,ts}",
      "*/_tests_/*.test.{js,mjs,cjs,ts}",
    ],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  tseslint.configs.recommended,
]);
