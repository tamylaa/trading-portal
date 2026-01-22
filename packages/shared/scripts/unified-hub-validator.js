#!/usr/bin/env node
/**
 * Unified Hub Compliance Validator
 * 
 * Combines architecture governance and infrastructure compliance 
 * into a single, comprehensive validation process for any hub.
 * 
 * Replaces:
 * - hub-governance.js (architecture patterns)
 * - detect-content-hub-violations.js (content-hub specific)
 * - validate-hub-compliance.js (infrastructure violations)
 * 
 * Usage:
 *   node scripts/unified-hub-validator.js --hub=content-hub
 *   node scripts/unified-hub-validator.js --all-hubs --production
 */

const fs = require('fs');
const path = require('path');

// Import existing validators
const { HubComplianceValidator } = require('./validate-hub-compliance.js');

class UnifiedHubValidator {
  constructor(options = {}) {
    this.options = {
      hubName: options.hub,
      allHubs: options.allHubs || false,
      production: options.production || false,
      verbose: options.verbose || false,
      failOnViolations: options.failOnViolations || false,
      outputFile: options.outputFile,
      ...options
    };
    
    this.results = [];
  }

  async validate() {
    console.log('🔍 UNIFIED HUB VALIDATION\n');
    
    const hubs = this.getTargetHubs();
    
    for (const hubName of hubs) {
      console.log(`🏗️ Validating ${hubName}...`);
      
      const hubResult = await this.validateHub(hubName);
      this.results.push(hubResult);
      
      this.displayHubResult(hubResult);
    }
    
    this.displaySummary();
    
    if (this.options.outputFile) {
      this.saveReport();
    }
    
    // Determine if validation passed
    const hasFailures = this.results.some(result => !result.overall.passed);
    
    if (this.options.failOnViolations && hasFailures) {
      console.log('\n❌ VALIDATION FAILED - Fix violations before proceeding');
      process.exit(1);
    }
    
    return this.results;
  }

  async validateHub(hubName) {
    const projectRoot = path.resolve(__dirname, '../../..');
    const hubPath = path.join(projectRoot, 'packages', hubName);
    
    // 1. Architecture Compliance
    const architectureResult = await this.validateArchitecture(hubName, hubPath);
    
    // 2. Infrastructure Compliance  
    const infrastructureResult = await this.validateInfrastructure(hubName);
    
    // 3. Overall Assessment
    const overallResult = this.assessOverall(hubName, architectureResult, infrastructureResult);
    
    return {
      hubName,
      architecture: architectureResult,
      infrastructure: infrastructureResult,
      overall: overallResult
    };
  }

  async validateArchitecture(hubName, hubPath) {
    const result = {
      score: 0,
      maxScore: 10,
      checks: [],
      passed: false
    };

    // Check 1: Package.json exists and well-formed
    const packageJsonPath = path.join(hubPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Correct naming
        if (packageJson.name === `@tamyla/${hubName}`) {
          result.checks.push({ name: 'Correct package naming', passed: true, score: 1 });
          result.score += 1;
        } else {
          result.checks.push({ name: 'Incorrect package naming', passed: false, score: 0 });
        }
        
        // Uses shared dependency
        if (packageJson.dependencies?.['@tamyla/shared']) {
          result.checks.push({ name: 'Uses @tamyla/shared dependency', passed: true, score: 2 });
          result.score += 2;
        } else {
          result.checks.push({ name: 'Missing @tamyla/shared dependency', passed: false, score: 0 });
        }
        
      } catch (error) {
        result.checks.push({ name: 'Invalid package.json', passed: false, score: 0 });
      }
    } else {
      result.checks.push({ name: 'Missing package.json', passed: false, score: 0 });
    }

    // Check 2: Has SharedXxxService implementation
    const baseName = this.capitalizeFirst(hubName.replace('-hub', ''));
    const sharedServicePaths = [
      path.join(hubPath, 'src', 'services', `Shared${baseName}Service.js`),
      path.join(hubPath, 'src', 'services', `Shared${baseName}HubService.js`),
      path.join(hubPath, 'services', `Shared${baseName}Service.js`)
    ];
    
    const hasSharedService = sharedServicePaths.some(p => fs.existsSync(p));
    if (hasSharedService) {
      result.checks.push({ name: 'Has SharedXxxService implementation', passed: true, score: 3 });
      result.score += 3;
    } else {
      result.checks.push({ name: 'Missing SharedXxxService implementation', passed: false, score: 0 });
    }

    // Check 3: Has main component 
    const mainComponentPath = path.join(hubPath, 'src', `Enhanced${this.capitalizeFirst(hubName.replace('-hub', ''))}Hub.jsx`);
    if (fs.existsSync(mainComponentPath)) {
      result.checks.push({ name: 'Has main hub component', passed: true, score: 2 });
      result.score += 2;
    } else {
      result.checks.push({ name: 'Missing main hub component', passed: false, score: 0 });
    }

    // Check 4: Migration guide exists
    const migrationGuidePath = path.join(hubPath, 'docs', 'MIGRATION_GUIDE.md');
    if (fs.existsSync(migrationGuidePath)) {
      result.checks.push({ name: 'Has migration guide', passed: true, score: 1 });
      result.score += 1;
    } else {
      result.checks.push({ name: 'Missing migration guide', passed: false, score: 0 });
    }

    // Check 5: Compliance scripts in package.json
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.scripts?.compliance) {
          result.checks.push({ name: 'Has compliance scripts', passed: true, score: 1 });
          result.score += 1;
        } else {
          result.checks.push({ name: 'Missing compliance scripts', passed: false, score: 0 });
        }
      } catch (error) {
        // Already handled above
      }
    }

    result.passed = result.score >= 7; // 70% threshold
    return result;
  }

  async validateInfrastructure(hubName) {
    try {
      const validator = new HubComplianceValidator({
        hub: hubName,
        complianceLevel: this.options.production ? 'strict' : 'standard',
        verbose: false,
        failOnViolations: false
      });

      const validationResults = await validator.validate();
      const hubResult = validationResults[0];

      return {
        violations: hubResult.violations,
        total: hubResult.total,
        compliant: hubResult.compliant,
        passed: hubResult.compliant
      };
    } catch (error) {
      return {
        violations: { critical: [], high: [], medium: [], low: [] },
        total: 0,
        compliant: false,
        passed: false,
        error: error.message
      };
    }
  }

  assessOverall(hubName, architectureResult, infrastructureResult) {
    const architectureScore = (architectureResult.score / architectureResult.maxScore) * 100;
    const infrastructureCompliant = infrastructureResult.compliant;
    
    // Overall passing criteria
    const passed = architectureScore >= 70 && infrastructureCompliant;
    
    let status = 'FAILED';
    let grade = 'F';
    
    if (passed) {
      if (architectureScore >= 90 && infrastructureResult.total === 0) {
        status = 'EXCELLENT';
        grade = 'A+';
      } else if (architectureScore >= 80) {
        status = 'GOOD';
        grade = 'A';
      } else {
        status = 'PASSING';
        grade = 'B';
      }
    } else if (architectureScore >= 50 || infrastructureResult.violations.critical.length === 0) {
      status = 'NEEDS WORK';
      grade = 'C';
    } else {
      status = 'CRITICAL';
      grade = 'F';
    }

    return {
      passed,
      status,
      grade,
      architectureScore,
      infrastructureCompliant,
      summary: `${Math.round(architectureScore)}% architecture, ${infrastructureResult.total} violations`
    };
  }

  displayHubResult(result) {
    const { hubName, architecture, infrastructure, overall } = result;
    
    console.log(`\n📋 ${hubName} Results:`);
    console.log(`   🎯 Overall: ${overall.status} (${overall.grade})`);
    console.log(`   🏗️ Architecture: ${architecture.score}/${architecture.maxScore} (${Math.round((architecture.score/architecture.maxScore)*100)}%)`);
    console.log(`   🔧 Infrastructure: ${infrastructure.total} violations (${infrastructure.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'})`);
    
    if (this.options.verbose) {
      console.log(`\n   🏗️ Architecture Details:`);
      architecture.checks.forEach(check => {
        const icon = check.passed ? '✅' : '❌';
        console.log(`      ${icon} ${check.name}`);
      });
      
      if (infrastructure.total > 0) {
        console.log(`\n   🔧 Infrastructure Violations:`);
        console.log(`      🔴 Critical: ${infrastructure.violations.critical.length}`);
        console.log(`      🟠 High: ${infrastructure.violations.high.length}`);
        console.log(`      🟡 Medium: ${infrastructure.violations.medium.length}`);
        console.log(`      🔵 Low: ${infrastructure.violations.low.length}`);
      }
    }
  }

  displaySummary() {
    console.log('\n📊 VALIDATION SUMMARY\n');
    
    const totalHubs = this.results.length;
    const passedHubs = this.results.filter(r => r.overall.passed).length;
    const failedHubs = totalHubs - passedHubs;
    
    console.log(`✅ Passed: ${passedHubs}/${totalHubs} hubs`);
    console.log(`❌ Failed: ${failedHubs}/${totalHubs} hubs`);
    
    if (passedHubs > 0) {
      console.log('\n🎉 PASSING HUBS:');
      this.results
        .filter(r => r.overall.passed)
        .forEach(r => console.log(`   ${r.hubName}: ${r.overall.status} (${r.overall.grade})`));
    }
    
    if (failedHubs > 0) {
      console.log('\n🚨 FAILING HUBS:');
      this.results
        .filter(r => !r.overall.passed)
        .forEach(r => {
          console.log(`   ${r.hubName}: ${r.overall.status} (${r.overall.grade})`);
          console.log(`      ${r.overall.summary}`);
        });
      
      console.log('\n🔧 NEXT STEPS:');
      console.log('1. Fix architecture issues (add missing components/files)');
      console.log('2. Resolve infrastructure violations using @tamyla/shared');
      console.log('3. Run with --verbose to see detailed issues');
      console.log('4. See migration guides: packages/<hub>/docs/MIGRATION_GUIDE.md');
    }
    
    console.log(`\n🎯 ${passedHubs === totalHubs ? 'ALL HUBS COMPLIANT!' : 'FIX FAILING HUBS BEFORE PROCEEDING'}`);
  }

  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      complianceLevel: this.options.production ? 'strict' : 'standard',
      summary: {
        totalHubs: this.results.length,
        passedHubs: this.results.filter(r => r.overall.passed).length,
        failedHubs: this.results.filter(r => !r.overall.passed).length
      },
      results: this.results
    };
    
    fs.writeFileSync(this.options.outputFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved: ${this.options.outputFile}`);
  }

  getTargetHubs() {
    // Navigate from packages/shared/scripts back to project root, then to packages
    const projectRoot = path.resolve(__dirname, '../../..');
    const packagesDir = path.join(projectRoot, 'packages');
    
    if (this.options.allHubs) {
      if (fs.existsSync(packagesDir)) {
        return fs.readdirSync(packagesDir)
          .filter(pkg => pkg.endsWith('-hub'))
          .filter(pkg => fs.existsSync(path.join(packagesDir, pkg)));
      }
      return [];
    } else if (this.options.hubName) {
      const hubPath = path.join(packagesDir, this.options.hubName);
      return fs.existsSync(hubPath) ? [this.options.hubName] : [];
    }
    
    console.error('❌ Must specify --hub=<hub-name> or --all-hubs');
    process.exit(1);
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// CLI Interface
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--hub=')) {
      options.hub = arg.split('=')[1];
    } else if (arg === '--all-hubs') {
      options.allHubs = true;
    } else if (arg === '--production') {
      options.production = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--fail-on-violations') {
      options.failOnViolations = true;
    } else if (arg.startsWith('--output=')) {
      options.outputFile = arg.split('=')[1];
    }
  });
  
  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  const validator = new UnifiedHubValidator(options);
  
  validator.validate().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = { UnifiedHubValidator };