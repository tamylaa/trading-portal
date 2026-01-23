let mod;
try {
  mod = require('./FeatureFlagContext.tsx');
} catch (err) {
  mod = require('./FeatureFlagContext');
}
const candidate = mod && (mod.default || mod);

module.exports.FeatureFlagProvider = candidate && (candidate.FeatureFlagProvider || candidate.default?.FeatureFlagProvider);
module.exports.useFeatureFlag = candidate && (candidate.useFeatureFlag || candidate.default?.useFeatureFlag);
module.exports.useFeatureFlags = candidate && (candidate.useFeatureFlags || candidate.default?.useFeatureFlags);
module.exports.FEATURE_FLAGS = candidate && (candidate.FEATURE_FLAGS || candidate.default?.FEATURE_FLAGS);
module.exports.default = candidate;
