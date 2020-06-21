import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";

export default {
  input: "src/main.ts",
  output: {
    file: "docs/bundle.js",
    format: "iife",
    name: "window",
    extend: true,
  },
  plugins: [typescript({ tsconfig: "tsconfig-rollup.json" }), commonjs()],
};
