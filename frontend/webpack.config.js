/* eslint-disable @typescript-eslint/no-var-requires */
var webpack = require('webpack');
var CopyWebpackPlugin =  require('copy-webpack-plugin');

module.exports = {
  mode: 'development',

  entry: './src/index.tsx',

  output: {
    publicPath: './build/',
    filename: 'bundle.js',
    path: __dirname + '/build'
  },

  devtool: 'source-map',

  target: 'web',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[hash]-[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new CopyWebpackPlugin([
      { from: '/Users/tedshaffer/Documents/Projects/shikkerdoodle/frontend/build/bundle.js', to: '/Users/tedshaffer/Documents/Projects/shikkerdoodle/backend/public/build' },
      { from: '/Users/tedshaffer/Documents/Projects/shikkerdoodle/frontend/build/bundle.js.map', to: '/Users/tedshaffer/Documents/Projects/shikkerdoodle/backend/public/build' },
    ]),
  ]
};
