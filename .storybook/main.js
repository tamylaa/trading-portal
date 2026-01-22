const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: '@storybook/react',
  staticDirs: ['../public'],
  core: {
    builder: '@storybook/builder-webpack5',
  },
  webpackFinal: async (config) => {
    // Ensure story files (.stories.*) are transpiled (JSX/TSX) by babel-loader
    config.module.rules.push({
      test: /\.stories\.(js|jsx|ts|tsx)$/,
      include: path.resolve(__dirname, '../src'),
      use: [{
        loader: require.resolve('babel-loader'),
        options: {
          presets: [
            ['@babel/preset-env', { targets: 'defaults' }],
            ['@babel/preset-react', { runtime: 'automatic' }],
            '@babel/preset-typescript'
          ]
        }
      }]
    });

    // Transpile TypeScript/TSX and JS files in the src directory
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      include: path.resolve(__dirname, '../src'),
      use: [{
        loader: require.resolve('babel-loader'),
        options: {
          presets: [
            ['@babel/preset-env', { targets: 'defaults' }],
            ['@babel/preset-react', { runtime: 'automatic' }],
            '@babel/preset-typescript'
          ]
        }
      }]
    });

    return config;
  },
};
