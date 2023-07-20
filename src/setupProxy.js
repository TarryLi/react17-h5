// eslint-disable-next-line import/no-extraneous-dependencies
const proxy = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(proxy('/api/cityos', {
    target: 'http://xxx.xxx.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api'
    }
  }));
};
