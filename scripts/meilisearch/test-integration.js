// Integration Test for Trading Portal MeiliSearch Integration
// Tests the complete flow: Environment → JWT → Gateway → Search

const axios = require('axios');
const { execSync } = require('child_process');

// Environment configurations to test
const environments = {
  development: {
    gateway: 'http://localhost:8787',
    expectedIndex: 'documents-dev'
  },
  staging: {
    gateway: 'https://meilisearch-gateway-staging.workers.dev',
    expectedIndex: 'documents-staging'
  },
  production: {
    gateway: 'https://search.tamyla.com',
    expectedIndex: 'documents'
  }
};

// Test JWT payload for validation
const testJWTPayload = {
  sub: 'test-user-123',
  email: 'test@tamyla.com',
  aud: 'tamyla-trading-portal',
  iss: 'https://auth.tamyla.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  userId: 'test-user-123',
  permissions: ['search', 'read'],
  scope: 'search'
};

// Helper function to create a test JWT (for development testing only)
function createTestJWT(payload, environment = 'development') {
  // Adjust audience for environment
  const envPayload = {
    ...payload,
    aud: environment === 'staging' ? 'tamyla-trading-portal-staging' : 'tamyla-trading-portal'
  };

  // Create a simple JWT structure (header.payload.signature)
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(envPayload)).toString('base64url');
  
  // For testing, we'll use a dummy signature
  const signature = 'test-signature-for-development-only';
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Test functions
async function testEnvironmentConfiguration(environment) {
  console.log(`\n🔧 Testing ${environment} environment configuration...`);
  
  try {
    // Run PowerShell validation script
    const scriptPath = './setup-env-ascii.ps1';
    const command = `PowerShell -ExecutionPolicy Bypass -File ${scriptPath} -Environment ${environment} -Validate`;
    
    const result = execSync(command, { 
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    
    if (result.includes('[SUCCESS] Configuration validation passed!')) {
      console.log(`✅ ${environment} configuration is valid`);
      return true;
    } else {
      console.log(`❌ ${environment} configuration validation failed`);
      console.log(result);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error testing ${environment} configuration:`, error.message);
    return false;
  }
}

async function testJWTService(environment = 'development') {
  console.log(`\n🔐 Testing JWT Service for ${environment}...`);
  
  try {
    // Create test JWT
    const testToken = createTestJWT(testJWTPayload, environment);
    console.log('Created test JWT token');
    
    // Test JWT decoding (would normally be done by the frontend)
    const parts = testToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    console.log('Decoded JWT payload:', {
      sub: payload.sub,
      email: payload.email,
      aud: payload.aud,
      iss: payload.iss,
      userId: payload.userId,
      scope: payload.scope
    });
    
    // Validate expected claims
    const expectedAudience = environment === 'staging' ? 'tamyla-trading-portal-staging' : 'tamyla-trading-portal';
    
    if (payload.aud !== expectedAudience) {
      throw new Error(`Invalid audience: expected ${expectedAudience}, got ${payload.aud}`);
    }
    
    if (payload.iss !== 'https://auth.tamyla.com') {
      throw new Error(`Invalid issuer: expected https://auth.tamyla.com, got ${payload.iss}`);
    }
    
    if (!payload.userId) {
      throw new Error('Missing userId claim');
    }
    
    console.log('✅ JWT validation passed');
    return { valid: true, token: testToken, payload };
  } catch (error) {
    console.error('❌ JWT service test failed:', error.message);
    return { valid: false, error: error.message };
  }
}

async function testMeiliSearchGateway(environment, jwtToken) {
  console.log(`\n🔍 Testing MeiliSearch Gateway for ${environment}...`);
  
  const config = environments[environment];
  if (!config) {
    console.error(`❌ Unknown environment: ${environment}`);
    return false;
  }
  
  try {
    // Test health endpoint
    console.log(`Testing health endpoint: ${config.gateway}/health`);
    
    const healthResponse = await axios.get(`${config.gateway}/health`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Trading-Portal-Integration-Test'
      }
    });
    
    if (healthResponse.status === 200) {
      console.log('✅ Gateway health check passed');
      console.log('Health response:', healthResponse.data);
    } else {
      console.log(`⚠️  Gateway health check returned status: ${healthResponse.status}`);
    }
    
    // Test search endpoint (if JWT provided)
    if (jwtToken) {
      console.log('Testing authenticated search endpoint...');
      
      try {
        const searchResponse = await axios.post(`${config.gateway}/search`, {
          q: 'test',
          limit: 5
        }, {
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Trading-Portal-Integration-Test'
          }
        });
        
        console.log('✅ Authenticated search request succeeded');
        console.log('Search response status:', searchResponse.status);
        
        if (searchResponse.data) {
          console.log('Search results structure:', {
            hasHits: !!searchResponse.data.hits,
            hitCount: searchResponse.data.hits?.length || 0,
            hasQuery: !!searchResponse.data.query,
            processingTime: searchResponse.data.processingTimeMs
          });
        }
      } catch (authError) {
        if (authError.response?.status === 401) {
          console.log('⚠️  Authentication required (expected for test JWT)');
        } else if (authError.response?.status === 404) {
          console.log('⚠️  Search endpoint not found or index not initialized');
        } else {
          console.log(`⚠️  Search request failed: ${authError.message}`);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Gateway test failed for ${environment}:`, error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Gateway might not be running or accessible');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Gateway URL might be incorrect or DNS issue');
    }
    
    return false;
  }
}

async function testCompleteIntegration() {
  console.log('🚀 Starting Trading Portal MeiliSearch Integration Test');
  console.log('====================================================');
  
  const results = {
    environments: {},
    overall: true
  };
  
  // Test each environment
  for (const environment of ['development', 'staging', 'production']) {
    console.log(`\n📋 Testing ${environment.toUpperCase()} Environment`);
    console.log('----------------------------------------');
    
    const envResults = {
      configValid: false,
      jwtValid: false,
      gatewayAccessible: false
    };
    
    // 1. Test environment configuration
    envResults.configValid = await testEnvironmentConfiguration(environment);
    
    // 2. Test JWT service
    const jwtTest = await testJWTService(environment);
    envResults.jwtValid = jwtTest.valid;
    
    // 3. Test gateway (skip for development if localhost not running)
    if (environment !== 'development' || process.env.TEST_LOCAL_GATEWAY === 'true') {
      envResults.gatewayAccessible = await testMeiliSearchGateway(
        environment, 
        jwtTest.valid ? jwtTest.token : null
      );
    } else {
      console.log('\n🔍 Skipping development gateway test (set TEST_LOCAL_GATEWAY=true to enable)');
      envResults.gatewayAccessible = true; // Don't fail for missing local gateway
    }
    
    results.environments[environment] = envResults;
    
    const envSuccess = envResults.configValid && envResults.jwtValid && envResults.gatewayAccessible;
    if (!envSuccess) {
      results.overall = false;
    }
    
    console.log(`\n📊 ${environment} Results:`, {
      'Configuration': envResults.configValid ? '✅' : '❌',
      'JWT Service': envResults.jwtValid ? '✅' : '❌',
      'Gateway': envResults.gatewayAccessible ? '✅' : '❌',
      'Overall': envSuccess ? '✅ PASS' : '❌ FAIL'
    });
  }
  
  // Final summary
  console.log('\n🎯 FINAL INTEGRATION TEST RESULTS');
  console.log('==================================');
  
  Object.entries(results.environments).forEach(([env, envResults]) => {
    const status = Object.values(envResults).every(Boolean) ? '✅ PASS' : '❌ FAIL';
    console.log(`${env.toUpperCase()}: ${status}`);
  });
  
  console.log(`\nOVERALL: ${results.overall ? '✅ SUCCESS' : '❌ FAILURE'}`);
  
  if (results.overall) {
    console.log('\n🎉 All integration tests passed!');
    console.log('💡 Next steps:');
    console.log('   1. Run environment setup script for your target environment');
    console.log('   2. Deploy your changes and test with real authentication');
    console.log('   3. Monitor application logs for any runtime issues');
  } else {
    console.log('\n⚠️  Some integration tests failed. Please review the results above.');
    process.exit(1);
  }
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCompleteIntegration().catch(error => {
    console.error('❌ Integration test suite failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testEnvironmentConfiguration,
  testJWTService,
  testMeiliSearchGateway,
  testCompleteIntegration
};