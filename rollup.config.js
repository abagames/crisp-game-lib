import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";

export default {
  input: "src/main.ts",
  output: {
    file: "docs/bundle.js",
    format: "iife",
    name: "window",
    extend: true,
  },
  plugins: [
    typescript({ tsconfig: "tsconfig-rollup.json" }),
    commonjs(),
    replace({
      values: { "this.window = this.window": "window" },
      preventAssignment: true,
    }),
  ],
};
