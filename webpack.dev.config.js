let path = require('path');
let webpack = require('webpack');
//let env = process.env.WEBPACK_BUILD || 'development';
// let nginx = 'http://10.20.0.151:8006';
//let nginx = 'http://192.168.6.215:10202';
let nginx = 'http://10.10.10.201:8006';
let config = [{
  devtool: 'source-map',
  devServer: {
    contentBase: './build',
    historyApiFallback: true,
    inline:false,
    hot:false,
    stats: {
      chunks: false
    },
    host:'0.0.0.0',
    proxy: {
      '/hbbmanagement_s': {
        target: nginx,
        changeOrigin: true,
        // pathRewrite: {
        //   '^/hbbmanagement_s': '/'
        // }
      },
        '/hbbclient_s': {
            target: nginx,
            changeOrigin: true,
            // pathRewrite: {
            //   '^/hbbmanagement_s': '/'
            // }
        },
    },
  },
  entry: {
    HBBManager: ['./docs/HBBManager/main/app'],
    vendor: ["react", "react-dom",'jquery'],
  },
  node: {
    fs: 'empty'
  },
  output: {
    path:'/' ,
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: 'chunks/[name].chunk.js',
  },
  module: require('./module.config.js'),
  resolve: require('./resolve.config.js'),
  plugins: require('./plugin.config.js'),
}];

module.exports = config;

