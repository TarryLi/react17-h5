/**
 * 更多插件参考：https://juejin.im/post/5dedd6c8f265da33d15884bf
 * npm customize-cra: https://www.npmjs.com/package/customize-cra
 */
const path = require('path');
const chalk = require('chalk');
const {
  override, addWebpackAlias, addLessLoader,
  addDecoratorsLegacy, addPostcssPlugins
} = require('customize-cra');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const addCustomize = () => (config) => {
  config.plugins.push(new ProgressBarPlugin({
    format: `  progress [:bar]  ${chalk.green.bold(':percent')} (:elapsed seconds)`,
    clear: false,
    width: 60
  }));
  if (process.env.REACT_APP_ENV === 'report') {
    config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }));
  }
  return config;
};

module.exports = {
  webpack: override(
    addDecoratorsLegacy(),
    addLessLoader({
      lessOptions: {
        javascriptEnabled: true,
        cssModules: {
          localIdentName: '[path][name]__[local]--[hash:base64:5]',
        },
        sourceMap: true
      }
    }),
    addPostcssPlugins([require('postcss-pxtorem')({
      // rootValue 等于 rem.js baseSize
      rootValue: 16,
      propList: ['*']
    })]),

    addWebpackAlias({
      '@': path.resolve(__dirname, 'src')
    }),

    addCustomize(),
  ),
  // devServer: overrideDevServer((configFunction) => {
  //   return configFunction;
  // }),
};
