import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  { ignores: [".next", "node_modules", "next-env.d.ts", "e2e/results", "e2e/report"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "error",
      "react/no-danger": "error",
      "max-lines": ["error", { max: 250, skipBlankLines: true, skipComments: true }],
    },
  },
];
