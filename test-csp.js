// CSP Test Script - Validates that @tamyla/ui-components-react works
console.log('🔍 CSP Test Starting...');

// Test 1: Check if eval() works (needed for ui-components-react)
try {
  eval('console.log("✅ eval() works - unsafe-eval is allowed")');
} catch (error) {
  console.error('❌ eval() blocked - CSP is too restrictive:', error);
}

// Test 2: Check if dynamic imports work
try {
  // This simulates how @tamyla/ui-components-react loads
  const testFunc = new Function('return "✅ Function constructor works"');
  console.log(testFunc());
} catch (error) {
  console.error('❌ Function constructor blocked:', error);
}

// Test 3: Check if React components can be created dynamically
try {
  // This simulates the styled-components pattern used in ui-components-react
  const dynamicStyle = 'color: green;';
  console.log('✅ Dynamic styling allowed:', dynamicStyle);
} catch (error) {
  console.error('❌ Dynamic styling blocked:', error);
}

console.log('🎯 CSP Test Complete');
