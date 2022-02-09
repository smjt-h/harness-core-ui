const path = require('path')
const fs = require('fs')

const webpack = require('webpack')
const { merge } = require('webpack-merge')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const JSONGeneratorPlugin = require('@harness/jarvis/lib/webpack/json-generator-plugin').default
const { BugsnagSourceMapUploaderPlugin } = require('webpack-bugsnag-plugins')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CircularDependencyPlugin = require('circular-dependency-plugin')

const commonConfig = require('./webpack.common')
const packageJson = require('../package.json')
const CONTEXT = process.cwd()

// this BUGSNAG_TOKEN needs to be same which is passed in the docker file
const BUGSNAG_TOKEN = process.env.BUGSNAG_TOKEN
const BUGSNAG_SOURCEMAPS_UPLOAD = process.env.BUGSNAG_SOURCEMAPS_UPLOAD === 'true'

const config = {
  mode: 'production',
  devtool: 'hidden-source-map',
  output: {
    path: path.resolve(CONTEXT, 'dist'),
    publicPath: '',
    filename: 'static/[name].[contenthash:6].js',
    chunkFilename: 'static/[name].[id].[contenthash:6].js',
    pathinfo: false
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: false,
      __BUGSNAG_RELEASE_VERSION__: JSON.stringify(packageJson.version)
    }),
    new HTMLWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      minify: false,
      templateParameters: {
        __DEV__: false
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'static/[name].[contenthash:6].css',
      chunkFilename: 'static/[name].[id].[contenthash:6].css'
    }),
    new JSONGeneratorPlugin({
      content: {
        version: packageJson.version,
        gitCommit: process.env.GIT_COMMIT,
        gitBranch: process.env.GIT_BRANCH
      },
      filename: 'static/version.json'
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true
    }),
    new HTMLWebpackPlugin({
      template: 'src/versions.html',
      filename: 'static/versions.html',
      minify: false,
      inject: false
    })
  ]
}

if (BUGSNAG_SOURCEMAPS_UPLOAD && BUGSNAG_TOKEN) {
  config.plugins.push(
    new BugsnagSourceMapUploaderPlugin({
      apiKey: BUGSNAG_TOKEN,
      appVersion: packageJson.version,
      publicPath: '*',
      overwrite: true
    })
  )
}

module.exports = merge(commonConfig, config)
