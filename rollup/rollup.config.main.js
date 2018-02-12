import buble from "rollup-plugin-buble";

export default {
  input: "src/index.js",
  plugins: [],
  output: [
    { file: "dist/object-reflector.js", format: "umd" }
  ]
};
