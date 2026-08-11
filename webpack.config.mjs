import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import WebpackBar from 'webpackbar';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import zlib from 'zlib';
import { offCatalog } from './src/offCatalog.js';

const production = true;

export default {
  performance: {
    hints: 'warning',
    maxAssetSize: 320 * 1024,
    maxEntrypointSize: 320 * 1024,
    assetFilter: assetFilename => !assetFilename.endsWith('.exr')
  },
  entry: { index: './src/viewer.js' },
  output: {
    filename: 'js/[name].[contenthash].js',
    chunkFilename: 'js/[name].[contenthash].chunk.js',
    path: path.resolve(import.meta.dirname, 'dist'),
    clean: true
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(import.meta.dirname, 'assets')
    }
  },
  optimization: {
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
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
          presets: [['@babel/preset-env']]
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
            maxSize: 4 * 1024
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
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
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
      algorithm: 'brotliCompress',
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11
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
      template: './src/index.ejs',
      templateParameters: { offCatalog },
      filename: 'index.html',
      chunks: ['index'],
      favicon: './assets/Logo.png'
    })
  ],
  devtool: production ? false : 'cheap-module-source-map',
  mode: production ? 'production' : 'development'
};
