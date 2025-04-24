const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils')
    },
    configure: (webpackConfig) => {
      // Explicitly set publicPath to root
      webpackConfig.output.publicPath = '/';
      return webpackConfig;
    }
  }
};