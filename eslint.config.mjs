import nextConfig from "eslint-config-next";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      ".node_modules/**",
      "docs/**"
    ]
  }
]);

export default eslintConfig;
