let mod;
try {
  // Prefer explicit TSX/JSX source to avoid circular resolution to this shim
  mod = require('./EmailBlasterTest.tsx');
} catch (err) {
  // Fallback to whatever resolves (for environments that transpile differently)
  mod = require('./EmailBlasterTest');
}

// Unwrap potential namespace objects that contain default or named exports.
const unwrap = (m) => {
  if (!m) return m;
  if (typeof m === 'function') return m;
  if (m.default && (typeof m.default === 'function' || typeof m.default === 'object')) return m.default;
  if (m.EmailBlasterTest && (typeof m.EmailBlasterTest === 'function' || typeof m.EmailBlasterTest === 'object')) return m.EmailBlasterTest;
  return m;
};

const component = unwrap(mod);

// Ensure we export a single callable component (for Jest and consumers)
module.exports = component;
module.exports.default = component;
module.exports.EmailBlasterTest = component;
