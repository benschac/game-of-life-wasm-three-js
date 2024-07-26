const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  experiments: {
    asyncWebAssembly: true, // enable WebAssembly
  },
  entry: "./bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "index.html", to: "" }],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: "webassembly/async",
      },
    ],
  },
};
