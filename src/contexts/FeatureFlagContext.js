const mod = require('./FeatureFlagContext');
module.exports = mod;
module.exports.FeatureFlagProvider = mod.FeatureFlagProvider || mod.default?.FeatureFlagProvider;
module.exports.useFeatureFlag = mod.useFeatureFlag || mod.default?.useFeatureFlag;
module.exports.useFeatureFlags = mod.useFeatureFlags || mod.default?.useFeatureFlags;
module.exports.FEATURE_FLAGS = mod.FEATURE_FLAGS || mod.default?.FEATURE_FLAGS;
