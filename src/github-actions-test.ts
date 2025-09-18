/* GitHub Actions Build Test */
/* This comment should appear in the deployed build if GitHub Actions is working */
/* Build timestamp: 2025-09-18-15:45:00 */
/* Latest commit: Force rebuild with BasicDebug */

console.log('🔍 GITHUB ACTIONS BUILD TEST - If you see this in production console, GitHub Actions is deploying our changes');

export const BUILD_TEST = {
  timestamp: '2025-09-18-15:45:00',
  commit: 'Force rebuild with BasicDebug',
  components: [
    'BasicDebug',
    'ErrorLogger', 
    'TamylaUIDebugger',
    'CompatibilityTest'
  ]
};

// Add to window for browser debugging
if (typeof window !== 'undefined') {
  (window as any).GITHUB_ACTIONS_BUILD_TEST = BUILD_TEST;
}
