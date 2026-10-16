import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // three.js is imperative: uniforms and renderer state are mutated every frame inside
    // useFrame, and geometry is seeded with Math.random once in useMemo. These React
    // Compiler rules don't apply to that code (the compiler isn't enabled here).
    files: ["components/canvas/**"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "scripts/**"]),
]);

export default eslintConfig;
