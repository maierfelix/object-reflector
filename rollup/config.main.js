import config from "./config";
import buble from "rollup-plugin-buble";

config.input = "src/index.js";
config.plugins = [
  buble()
];
config.output = [
  { file: "dist/object-reflector.js", format: "umd" }
];

export default config;
