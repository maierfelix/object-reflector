import json from "rollup-plugin-json";

export default {
  name: "ObjectReflector",
  external: [],
  plugins: [
    json(),
    buble()
  ]
};
