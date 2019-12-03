const { bundleConfig, outputConfig } = require('./rollup.settings');

export default {
  ...bundleConfig,
  output: outputConfig,
};
