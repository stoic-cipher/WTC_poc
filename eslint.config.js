// eslint.config.js
import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import importPlugin from "eslint-plugin-import";
import configPrettier from "eslint-config-prettier";

export default [
  { ignores: ["node_modules", "dist", ".astro", "public", "**/*.d.ts"] },
  js.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["**/*.{js,ts,astro}"],
    plugins: { import: importPlugin },
    rules: { "import/order": ["warn", { "newlines-between": "always" }] },
  },
  configPrettier,
];
