const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: "development",
  context: path.resolve(__dirname, 'src'),
  resolve: {
    modules: ['src']
  },
  entry: {
    server: './index.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    libraryTarget: 'commonjs2',
    filename: 'bot.js'
  },
  watchOptions: {
    ignored: /node_modules|dist/,
  },
  target: 'node',
  node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false,   // if you don't put this is, __dirname
    __filename: false,  // and __filename return blank or /
  },
  externals: [nodeExternals()], // Need this to avoid error when working with Express
  module: {
    rules: [
      {
        // Transpiles ES6-8 into ES5
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   loader: 'eslint-loader',
      //   options: {
      //     emitErrors: true,
      //     emitWarning: true,
      //     // failOnError: true
      //   },
      // },
    ]
  },
  plugins: [


  ]
}