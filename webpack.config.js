const path = require('path');
// const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin'); // Not working

const devMode = process.env.NODE_ENV === 'development';
const publicPath = devMode ? 'http://localhost:8080/' : '';
const outputDir = 'dist';

module.exports = {
  context: path.resolve(__dirname),
  devtool: devMode ? 'source-map' : false,
  entry: {
    app: './src/app.js'
  },
  output: {
    filename: 'assets/' + (devMode ? '[name].bundle.js' : '[name].[hash].bundle.js'),
    // Webpack code splitting - Dynamic Imports
    // chunkFilename: (devMode ? '[name].bundle.js' : '[name].[hash].bundle.js'),
    path: path.join(__dirname, outputDir),
    publicPath: publicPath
  },
  module: {
    rules: [
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        loader: 'image-webpack-loader',
        enforce: 'pre',
        options: {
          disable: devMode,
          mozjpeg: {
            progressive: true,
            quality: 65
          },
          // optipng.enabled: false will disable optipng
          optipng: {
            enabled: true,
          },
          pngquant: {
            quality: [0.65, 0.90],
            speed: 4
          },
          gifsicle: {
            interlaced: false,
          },
          // the webp option will enable WEBP
          // webp: {
          //   quality: 75
          // }
        },
      }, {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          name: 'fonts/[name].[ext]',
          context: 'src',
          publicPath: publicPath + '/assets/',
          outputPath: 'assets/',
          esModule: false,
          limit: 1 * 1024 //1KB
        }
      }, {
        test: /\.(png|jpeg|jpg|gif)$/,
        loader: 'url-loader',
        options: {
          name: 'images/[name].[ext]',
          context: 'src',
          publicPath: publicPath + '/assets/',
          outputPath: 'assets/',
          esModule: false,
          limit: 1 * 1024 //1KB
        }
      }, {
        test: /\.svg$/,
        loader: 'svg-url-loader',
        options: {
          // name: '[path][name].[ext]',
          name(file) {
            if (/fonts/.test(file)) {
              return 'fonts/[name].[ext]';
            }
            return 'vectors/[name].[ext]';
          },
          context: 'src',
          publicPath: publicPath + '/assets/',
          outputPath: 'assets/',
          limit: 2 * 1024, //2KB
          noquotes: true,
        }
      }, {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              sourceMap: devMode
            }
          }, {
            loader: 'css-loader',
            options: {
              // url: false,
              sourceMap: devMode
            }
          }, {
            loader: "postcss-loader",
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('postcss-preset-env')(),
                require("autoprefixer")({ grid: false }),
                require("css-mqpacker")(),
                require('cssnano')()
              ],
              sourceMap: devMode
            }
            // }, {
            //     loader: 'resolve-url-loader'
          }, {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [
                  './node_modules',
                  path.join(__dirname, 'src', 'images')
                ],
              },
              sourceMap: devMode
            }
          }
        ]
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }, {
        test: /\.(pug|jade)$/,
        use: [
          {
            loader: 'pug-loader',
            options: {
              pretty: true
            },
          },
        ]
      }
    ]
  },
  resolve: {
    extensions: [
      '.js',
      '.pug', '.jade',
      '.scss', '.sass', '.css',
      '.eot', '.ttf', '.woff', '.woff2',
      '.jpg', '.jpeg', '.png', '.svg', '.gif', '.ico',
    ],
    alias: {
      'src': path.join(__dirname, 'src')
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'assets/' + (devMode ? '[name].bundle.css' : '[name].[hash].bundle.css')
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'Home',
      favicon: 'src/images/favicon.ico',
      template: 'src/pug/index.pug',
      minify: false, // remove to minify html
      // chunks: ['vendors~app~main', 'vendors~app', 'app~main', 'app'], // when splitchunck enabled
    }),
    // new HtmlBeautifyPlugin({
    //   config: {
    //     html: {
    //       end_with_newline: true,
    //       indent_size: 2,
    //       indent_with_tabs: true,
    //       indent_inner_html: true,
    //       preserve_newlines: true,
    //       unformatted: ['p', 'i', 'b', 'span']
    //     }
    //   },
    //   replace: [' type="text/javascript"']
    // }),
    // new webpack.ProvidePlugin({
    //   $: 'jquery',
    //   jQuery: 'jquery'
    // }),
  ],
  optimization: {
    minimize: !(devMode),
    minimizer: [new TerserPlugin({
      parallel: true,
      sourceMap: devMode,
      terserOptions: {
        // output: {
        //   comments: devMode,
        // },
        warnings: false,
      },
      extractComments: true,
    })],
    // splitChunks: {
    //   chunks: 'all'
    // }
  },
}
