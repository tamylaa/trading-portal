module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: '@storybook/react',
  staticDirs: ['../public'],
  core: {
    builder: '@storybook/builder-webpack5',
  },
};
