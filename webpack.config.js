const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackBar = require('webpackbar');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const production = true;

module.exports = ({
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
    cacheDirectory: path.resolve(__dirname, '.webpack_cache'),
    name: 'cache'
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 320 * 1024,
    maxEntrypointSize: 320 * 1024,
    assetFilter: (assetFilename) => !assetFilename.endsWith('.exr')
  },
  entry: {index: './src/viewer.js'},
  output: {
    filename: 'js/[name].[contenthash].js',
    chunkFilename: 'js/[name].[contenthash].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  optimization: {
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin()
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 4 * 1024,
      minChunks: 1,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env'
            ]
          ]
        }
      },
      {
        test: /\.typeface\.json$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].[contenthash][ext]'
        }
      },
      {
        test: /\.(off|exr)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024,
          }
        },
        generator: {
          filename: 'assets/[name].[contenthash][ext]',
          dataUrl: {
            mimetype: 'text/plain'
          }
        }
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                silenceDeprecations: [
                  'mixed-decls',
                  'color-functions',
                  'global-builtin',
                  'import'
                ]
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new WebpackBar(),
    new CompressionPlugin({
      test: /\.(off|css|js)$/,
      algorithm: 'brotliCompress',  // 使用 Brotli
      compressionOptions: {
        params: {
          [require('zlib').constants.BROTLI_PARAM_QUALITY]: 11  // Brotli 质量级别 0-11，11 最高
        }
      },
      threshold: 10240,
      minRatio: 0.8,
      deleteOriginalAssets: true
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      title: '多胞形预览器',
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index']
    })
  ],
  devtool: production ? false : 'cheap-module-source-map',
  mode: production ? 'production' : 'development'
});
