import { defineConfig } from "tsup";
import { copyFileSync } from "fs";

export default defineConfig({
  entry: ["lib/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    compilerOptions: {
      jsx: "react-jsx",
    },
  },
  tsconfig: "tsconfig.lib.json",
  clean: true,
  sourcemap: true,
  external: ["react", "react-dom"],
  outDir: "dist-lib",
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
  onSuccess: async () => {
    // Copy CSS to dist-lib
    copyFileSync("lib/styles.css", "dist-lib/styles.css");
    console.log("Copied styles.css to dist-lib/");
  },
});
