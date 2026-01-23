const mod = require('./index.ts');

// Re-export everything from the TypeScript module
module.exports = mod;
// Named convenience exports
module.exports.store = mod.store;
module.exports.authActions = mod.authActions;
module.exports.uiActions = mod.uiActions;
module.exports.dashboardActions = mod.dashboardActions;
module.exports.preferencesActions = mod.preferencesActions;
