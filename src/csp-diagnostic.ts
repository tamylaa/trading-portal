/* CSP Diagnostic Tool */
/* This will run immediately and show what CSP is actually being enforced */

console.log('🔍 CSP DIAGNOSTIC STARTING...');

// Check what CSP is actually applied
const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
const httpCSP = '(check network tab for actual HTTP headers)';

console.log('📋 CSP ANALYSIS:');
console.log('Meta CSP:', metaCSP?.getAttribute('content') || 'None');
console.log('Meta CSP includes unsafe-eval:', metaCSP?.getAttribute('content')?.includes('unsafe-eval') || false);

// Test if eval is actually allowed
let evalAllowed = false;
try {
  // This should trigger CSP violation if eval is blocked
  eval('1+1');
  evalAllowed = true;
  console.log('✅ eval() is ALLOWED');
} catch (error) {
  console.log('❌ eval() is BLOCKED:', error);
}

// Test if Function constructor is allowed (alternative to eval)
let functionAllowed = false;
try {
  new Function('return 1+1')();
  functionAllowed = true;
  console.log('✅ Function constructor is ALLOWED');
} catch (error) {
  console.log('❌ Function constructor is BLOCKED:', error);
}

// Add visible indicator on page
const indicator = document.createElement('div');
indicator.style.cssText = `
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${evalAllowed ? 'green' : 'red'};
  color: white;
  padding: 20px;
  z-index: 999999;
  font-family: monospace;
  font-size: 14px;
  border: 3px solid white;
  text-align: center;
`;

indicator.innerHTML = `
  <div><strong>🔬 CSP DIAGNOSTIC</strong></div>
  <div>eval() allowed: ${evalAllowed ? '✅' : '❌'}</div>
  <div>Function() allowed: ${functionAllowed ? '✅' : '❌'}</div>
  <div>Meta CSP unsafe-eval: ${metaCSP?.getAttribute('content')?.includes('unsafe-eval') ? '✅' : '❌'}</div>
  <div style="margin-top: 10px; font-size: 12px;">
    ${evalAllowed ? 'UI components should work' : 'This is why UI components fail!'}
  </div>
`;

document.body.appendChild(indicator);

// Remove after 10 seconds
setTimeout(() => {
  indicator.remove();
}, 10000);

export const CSP_DIAGNOSTIC = {
  metaCSP: metaCSP?.getAttribute('content'),
  evalAllowed,
  functionAllowed,
  timestamp: new Date().toISOString()
};
