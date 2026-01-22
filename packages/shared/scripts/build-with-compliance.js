#!/usr/bin/env node
/**
 * Hub Build Integration with Compliance Reporting
 * 
 * Integrates compliance checks into the build process with detailed reporting.
 * Shows compliance status, progress tracking, and actionable remediation steps.
 * 
 * Usage:
 *   node scripts/build-with-compliance.js --hub=content-hub
 *   node scripts/build-with-compliance.js --all-hubs --production
 */

const { execSync } = require('child_process');
const { HubComplianceValidator } = require('./validate-hub-compliance.js');
const fs = require('fs');
const path = require('path');

class HubBuildIntegration {
  constructor(options = {}) {
    this.options = {
      hubName: options.hub,
      allHubs: options.allHubs || false,
      production: options.production || false,
      skipBuild: options.skipBuild || false,
      reportFile: options.reportFile || 'build-compliance-report.json',
      ...options
    };
    
    this.buildResults = [];
    this.startTime = Date.now();
  }

  async run() {
    this.printBuildHeader();
    
    try {
      // Step 1: Run compliance validation
      console.log('🔍 STEP 1: Infrastructure Compliance Validation\n');
      const complianceResults = await this.runComplianceCheck();
      
      // Step 2: Show compliance status
      this.displayComplianceStatus(complianceResults);
      
      // Step 3: Build decision
      const shouldProceed = this.shouldProceedWithBuild(complianceResults);
      
      if (!shouldProceed) {
        console.log('🚫 BUILD HALTED - Compliance violations detected');
        this.showRemediationSteps(complianceResults);
        process.exit(1);
      }
      
      // Step 4: Execute builds
      if (!this.options.skipBuild) {
        console.log('\n🏗️ STEP 2: Building Hubs\n');
        await this.executeBuilds();
      }
      
      // Step 5: Final report
      this.generateBuildReport(complianceResults);
      
      console.log('✅ BUILD COMPLETED SUCCESSFULLY');
      
    } catch (error) {
      console.error('❌ BUILD FAILED:', error.message);
      process.exit(1);
    }
  }

  printBuildHeader() {
    const timestamp = new Date().toISOString();
    console.log('🚀 HUB BUILD WITH COMPLIANCE INTEGRATION');
    console.log('═'.repeat(50));
    console.log(`⏰ Started: ${timestamp}`);
    console.log(`🎯 Mode: ${this.options.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`📦 Target: ${this.options.allHubs ? 'ALL HUBS' : this.options.hubName}`);
    console.log('═'.repeat(50));
    console.log();
  }

  async runComplianceCheck() {
    const validatorOptions = {
      hub: this.options.hubName,
      allHubs: this.options.allHubs,
      complianceLevel: this.options.production ? 'strict' : 'standard',
      verbose: false,
      failOnViolations: false
    };
    
    const validator = new HubComplianceValidator(validatorOptions);
    return await validator.validate();
  }

  displayComplianceStatus(complianceResults) {
    console.log('📊 COMPLIANCE STATUS REPORT\n');
    
    complianceResults.forEach(result => {
      const status = result.compliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT';
      const violations = result.violations;
      
      console.log(`🏗️ ${result.hubName}: ${status}`);
      
      if (result.total > 0) {
        console.log(`   🔴 Critical: ${violations.critical.length}`);
        console.log(`   🟠 High: ${violations.high.length}`);
        console.log(`   🟡 Medium: ${violations.medium.length}`);
        console.log(`   🔵 Low: ${violations.low.length}`);
        console.log(`   📊 Total: ${result.total} violations`);
      } else {
        console.log('   🎉 Perfect compliance - 0 violations!');
      }
      
      console.log();
    });
    
    const totalHubs = complianceResults.length;
    const compliantHubs = complianceResults.filter(r => r.compliant).length;
    const totalViolations = complianceResults.reduce((sum, r) => sum + r.total, 0);
    
    console.log(`📈 SUMMARY: ${compliantHubs}/${totalHubs} hubs compliant, ${totalViolations} total violations`);
  }

  shouldProceedWithBuild(complianceResults) {
    if (this.options.production) {
      // Production builds require strict compliance
      return complianceResults.every(result => result.compliant);
    } else {
      // Development builds allow some violations but not critical ones
      return complianceResults.every(result => 
        result.violations.critical.length === 0
      );
    }
  }

  async executeBuilds() {
    const hubPaths = this.getHubPaths();
    
    for (const hubPath of hubPaths) {
      const hubName = path.basename(hubPath);
      console.log(`📦 Building ${hubName}...`);
      
      try {
        const buildStart = Date.now();
        
        // Check if package.json exists and has build script
        const packageJsonPath = path.join(hubPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
          console.log(`   ⚠️ No package.json found - skipping`);
          continue;
        }
        
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (!packageJson.scripts?.build) {
          console.log(`   ⚠️ No build script found - skipping`);
          continue;
        }
        
        // Execute build
        const currentDir = process.cwd();
        process.chdir(hubPath);
        execSync('npm run build', { stdio: 'pipe' });
        process.chdir(currentDir);
        
        const buildTime = Date.now() - buildStart;
        console.log(`   ✅ Built in ${buildTime}ms`);
        
        this.buildResults.push({
          hubName,
          success: true,
          buildTime,
          error: null
        });
        
      } catch (error) {
        console.log(`   ❌ Build failed: ${error.message}`);
        
        this.buildResults.push({
          hubName,
          success: false,
          buildTime: 0,
          error: error.message
        });
        
        if (this.options.production) {
          throw new Error(`Production build failed for ${hubName}`);
        }
      }
    }
  }

  getHubPaths() {
    // Navigate from packages/shared/scripts back to project root, then to packages  
    const projectRoot = path.resolve(__dirname, '../../..');
    const packagesDir = path.join(projectRoot, 'packages');
    
    if (this.options.allHubs) {
      if (fs.existsSync(packagesDir)) {
        return fs.readdirSync(packagesDir)
          .filter(pkg => pkg.endsWith('-hub'))
          .map(pkg => path.join(packagesDir, pkg))
          .filter(hubPath => fs.existsSync(hubPath));
      }
      return [];
    } else if (this.options.hubName) {
      const hubPath = path.join(packagesDir, this.options.hubName);
      return fs.existsSync(hubPath) ? [hubPath] : [];
    }
    
    return [];
  }

  showRemediationSteps(complianceResults) {
    const nonCompliantHubs = complianceResults.filter(r => !r.compliant);
    
    if (nonCompliantHubs.length === 0) return;
    
    console.log('\n🔧 REMEDIATION STEPS REQUIRED\n');
    
    nonCompliantHubs.forEach(hub => {
      console.log(`📋 ${hub.hubName} Fixes Required:`);
      
      if (hub.violations.critical.length > 0) {
        console.log(`   🔴 ${hub.violations.critical.length} Critical violations - MUST FIX`);
        console.log('      • Replace custom HTTP clients with @tamyla/shared/api');
        console.log('      • Replace custom event systems with @tamyla/shared/events');
      }
      
      if (hub.violations.high.length > 0) {
        console.log(`   🟠 ${hub.violations.high.length} High priority violations`);
        console.log('      • Replace localStorage with @tamyla/shared/auth');
        console.log('      • Replace fetch() with @tamyla/shared/api methods');
      }
      
      if (hub.violations.medium.length > 0) {
        console.log(`   🟡 ${hub.violations.medium.length} Medium priority violations`);
        console.log('      • Replace console.* with @tamyla/shared/utils Logger');
      }
      
      console.log(`   📖 See: packages/${hub.hubName}/docs/MIGRATION_GUIDE.md`);
      console.log(`   🔍 Run: npm run compliance:verbose --prefix packages/${hub.hubName}`);
      console.log();
    });
    
    console.log('🚀 Quick commands to fix violations:');
    console.log(`   node scripts/validate-hub-compliance.js --${this.options.allHubs ? 'all-hubs' : `hub=${this.options.hubName}`} --verbose`);
  }

  generateBuildReport(complianceResults) {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;
    
    const report = {
      timestamp: new Date().toISOString(),
      mode: this.options.production ? 'production' : 'development',
      totalBuildTime: totalTime,
      compliance: {
        totalHubs: complianceResults.length,
        compliantHubs: complianceResults.filter(r => r.compliant).length,
        totalViolations: complianceResults.reduce((sum, r) => sum + r.total, 0),
        hubResults: complianceResults
      },
      builds: {
        attempted: this.buildResults.length,
        successful: this.buildResults.filter(r => r.success).length,
        failed: this.buildResults.filter(r => !r.success).length,
        results: this.buildResults
      }
    };
    
    fs.writeFileSync(this.options.reportFile, JSON.stringify(report, null, 2));
    
    console.log('\n📊 BUILD SUMMARY');
    console.log(`   ⏰ Total time: ${totalTime}ms`);
    console.log(`   ✅ Builds successful: ${report.builds.successful}/${report.builds.attempted}`);
    console.log(`   🎯 Compliance: ${report.compliance.compliantHubs}/${report.compliance.totalHubs} hubs`);
    console.log(`   📄 Report saved: ${this.options.reportFile}`);
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
    } else if (arg === '--skip-build') {
      options.skipBuild = true;
    } else if (arg.startsWith('--report=')) {
      options.reportFile = arg.split('=')[1];
    }
  });
  
  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  const buildIntegration = new HubBuildIntegration(options);
  
  buildIntegration.run().catch(error => {
    console.error('❌ Build integration failed:', error.message);
    process.exit(1);
  });
}

module.exports = { HubBuildIntegration };