#!/usr/bin/env node
/**
 * Hub Governance Pre-commit Hook
 * 
 * Prevents commits containing infrastructure violations.
 * Runs compliance checks on modified hub files before allowing commit.
 * 
 * Installation:
 *   cp packages/shared/scripts/pre-commit-compliance.js .git/hooks/pre-commit
 *   chmod +x .git/hooks/pre-commit
 * 
 * Or use with husky:
 *   npm install husky --save-dev
 *   npx husky add .husky/pre-commit "node packages/shared/scripts/pre-commit-compliance.js"
 */

const { execSync } = require('child_process');
const { HubComplianceValidator } = require('./validate-hub-compliance.js');
const path = require('path');

class PreCommitComplianceChecker {
  constructor() {
    this.modifiedHubs = new Set();
    this.stagingViolations = [];
  }

  async run() {
    console.log('🔍 Pre-commit Hub Compliance Check\n');
    
    try {
      // Get list of staged files
      const stagedFiles = this.getStagedFiles();
      
      if (stagedFiles.length === 0) {
        console.log('✅ No staged files to check');
        return true;
      }

      // Identify which hubs have been modified
      this.identifyModifiedHubs(stagedFiles);
      
      if (this.modifiedHubs.size === 0) {
        console.log('✅ No hub files modified');
        return true;
      }

      console.log(`🏗️ Checking ${this.modifiedHubs.size} modified hub(s): ${Array.from(this.modifiedHubs).join(', ')}\n`);

      // Run compliance checks on modified hubs
      let hasViolations = false;
      
      for (const hubName of this.modifiedHubs) {
        const isCompliant = await this.checkHubCompliance(hubName);
        if (!isCompliant) {
          hasViolations = true;
        }
      }

      if (hasViolations) {
        this.printViolationSummary();
        return false;
      }

      console.log('✅ All modified hubs are compliant');
      return true;

    } catch (error) {
      console.error('❌ Pre-commit check failed:', error.message);
      return false;
    }
  }

  getStagedFiles() {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      return output.split('\n').filter(file => file.trim() !== '');
    } catch (error) {
      console.warn('⚠️ Could not get staged files:', error.message);
      return [];
    }
  }

  identifyModifiedHubs(stagedFiles) {
    stagedFiles.forEach(file => {
      // Check if file is in a hub directory
      const match = file.match(/^packages\/([^\/]*-hub)\//);
      if (match) {
        this.modifiedHubs.add(match[1]);
      }
    });
  }

  async checkHubCompliance(hubName) {
    console.log(`   📋 Checking ${hubName}...`);
    
    try {
      const validator = new HubComplianceValidator({
        hub: hubName,
        complianceLevel: 'strict',  // Use strict level for commits
        verbose: false
      });

      const results = await validator.validate();
      const hubResult = results[0];

      if (hubResult.compliant) {
        console.log(`   ✅ ${hubName}: COMPLIANT\n`);
        return true;
      } else {
        console.log(`   ❌ ${hubName}: ${hubResult.total} violations`);
        console.log(`      🔴 Critical: ${hubResult.violations.critical.length}`);
        console.log(`      🟠 High: ${hubResult.violations.high.length}`);
        console.log(`      🟡 Medium: ${hubResult.violations.medium.length}`);
        console.log(`      🔵 Low: ${hubResult.violations.low.length}\n`);
        
        this.stagingViolations.push({
          hubName,
          violations: hubResult.violations,
          total: hubResult.total
        });
        
        return false;
      }
    } catch (error) {
      console.error(`   ❌ ${hubName}: Compliance check failed -`, error.message);
      return false;
    }
  }

  printViolationSummary() {
    console.log('🚨 COMMIT BLOCKED - Infrastructure Violations Detected\n');
    
    const totalViolations = this.stagingViolations.reduce((sum, hub) => sum + hub.total, 0);
    
    console.log(`📊 Total violations: ${totalViolations}`);
    console.log(`🏗️ Affected hubs: ${this.stagingViolations.map(h => h.hubName).join(', ')}\n`);
    
    console.log('🔧 REQUIRED ACTIONS:');
    console.log('1. Fix infrastructure violations using @tamyla/shared');
    console.log('2. Run compliance check: npm run compliance:verbose');
    console.log('3. See migration guide: packages/<hub>/docs/MIGRATION_GUIDE.md');
    console.log('4. Re-stage your changes after fixes');
    console.log('5. Try committing again\n');
    
    console.log('💡 QUICK FIXES:');
    console.log('   • Replace fetch() → shared ApiClient');
    console.log('   • Replace localStorage → shared AuthService'); 
    console.log('   • Replace console.* → shared Logger');
    console.log('   • Replace custom events → shared EventBus\n');
    
    console.log('🚀 Or bypass (NOT RECOMMENDED): git commit --no-verify');
  }
}

// Husky compatibility - export function for programmatic use
async function preCommitCompliance() {
  const checker = new PreCommitComplianceChecker();
  const success = await checker.run();
  
  if (!success) {
    process.exit(1);
  }
  
  return success;
}

// Direct execution for git hooks
if (require.main === module) {
  preCommitCompliance();
}

module.exports = { PreCommitComplianceChecker, preCommitCompliance };