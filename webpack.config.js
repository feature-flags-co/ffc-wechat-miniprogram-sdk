const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const baseConfig = {
  entry: {
    [`index`]: './src/index.ts'
  },
  //devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      minify: TerserPlugin.esbuildMinify,
      terserOptions: {
        minify: false,
        minifyWhitespace: true,
        minifyIdentifiers: false,
        minifySyntax: false,
      }
    })]
  },
};

const tsConfig = {
  ...baseConfig, output: {
    path: path.resolve(__dirname, 'build'),
    filename: `[name].js`,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    // prevent error: `Uncaught ReferenceError: self is not define`
    globalObject: 'this',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "*.d.ts",
          context: path.resolve(__dirname, "ts-build"),
        },
      ],
    }),
  ],
};

const jsConfig = {
  ...baseConfig, output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `[name].js`,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    // prevent error: `Uncaught ReferenceError: self is not define`
    globalObject: 'this',
  }
};

module.exports = [
  tsConfig,
  jsConfig
];