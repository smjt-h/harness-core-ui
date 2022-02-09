/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const path = require('path')
const fs = require('fs')

const webpack = require('webpack')
const { mergeWithRules } = require('webpack-merge')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const commonConfig = require('./webpack.common')
const devServerProxyConfig = require('./devServerProxy.config')

const CONTEXT = process.cwd()
const isCypressCoverage = process.env.CYPRESS_COVERAGE === 'true'
const isCypress = process.env.CYPRESS === 'true'

const certificateExists = fs.existsSync(path.join(CONTEXT, 'certificates/localhost.pem'))

if (!certificateExists) {
  throw new Error('The certificate is missing, please run `yarn generate-certificate`')
}

const config = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  cache: { type: 'filesystem' },
  output: {
    path: path.resolve(CONTEXT, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].[id].js',
    pathinfo: false,
    assetModuleFilename: 'images/[hash:6][ext][query]'
  },
  devServer: {
    historyApiFallback: true,
    port: 8181,
    client: {
      overlay: !(isCypress || isCypressCoverage)
    },
    https: {
      key: fs.readFileSync(path.resolve(CONTEXT, 'certificates/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(CONTEXT, 'certificates/localhost.pem'))
    },
    proxy: Object.fromEntries(
      Object.entries(devServerProxyConfig).map(([key, value]) => [
        key,
        Object.assign({ logLevel: 'info', secure: false, changeOrigin: true }, value)
      ])
    )
  },
  module: {
    rules: [
      {
        test: /\.module\.scss$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[name]_[local]_[hash:base64:6]',
                exportLocalsConvention: 'camelCaseOnly'
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: true
    }),
    new HTMLWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      minify: false,
      templateParameters: {
        __DEV__: true,
        __NON_CDN_BASE_PATH__: '/'
      }
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].[id].css'
    }),
    new webpack.WatchIgnorePlugin({
      paths: [/node_modules(?!\/@harness)/, /\.(d|test)\.tsx?$/, /stringTypes\.ts/, /\.snap$/]
    })
  ]
}

// merging loader options
let mergedConfig = mergeWithRules({
  module: {
    rules: {
      test: 'match',
      use: {
        loader: 'match',
        options: 'merge'
      }
    }
  }
})(commonConfig, config)

// update rules for cypress
if (isCypress && isCypressCoverage) {
  mergedConfig = mergeWithRules({
    module: {
      rules: {
        test: 'match',
        use: 'prepend'
      }
    }
  })(mergedConfig, {
    module: {
      rules: {
        test: /\.(j|t)sx?$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
    }
  })
} else {
  mergedConfig.plugins.push(new ForkTsCheckerWebpackPlugin())
}

module.exports = mergedConfig
