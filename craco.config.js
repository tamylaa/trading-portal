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
      // Set CSP-compliant devtool (no eval usage)
      webpackConfig.devtool = 'cheap-module-source-map';
      
      // Explicitly set publicPath to root
      webpackConfig.output.publicPath = '/';
      
      // Add fallbacks for Node.js modules used by @tamyla/ui-components-react
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "fs": false,
        "path": false,
        "crypto": false,
        "stream": false,
        "buffer": false,
        "util": false
      };
      
      // Add process polyfill for @tamyla/ui-components-react
      const webpack = require('webpack');
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.DefinePlugin({
          'process': JSON.stringify({
            env: process.env,
            platform: process.platform,
            version: process.version
          })
        })
      ];
      
      // Add rule for markdown files
      webpackConfig.module.rules.push({
        test: /\.md(\?raw)?$/,
        use: 'raw-loader',
        type: 'javascript/auto',
      });
      
      // Suppress warnings from @tamyla/ui-components-react dynamic imports
      webpackConfig.stats = {
        warningsFilter: (warning) => warning.message.includes('Critical dependency: the request of a dependency is an expression')
      };
      
      return webpackConfig;
    }
  }
};