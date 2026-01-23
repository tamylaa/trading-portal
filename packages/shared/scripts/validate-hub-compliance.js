#!/usr/bin/env node
/**
 * Hub Infrastructure Compliance Validator
 * 
 * Generic script to validate any hub for shared infrastructure compliance.
 * Prevents deployment of hubs that don't follow governance standards.
 * 
 * Usage:
 *   node scripts/validate-hub-compliance.js --hub=content-hub
 *   node scripts/validate-hub-compliance.js --hub=campaign-hub --fail-on-violations
 *   node scripts/validate-hub-compliance.js --all-hubs --strict
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration for different hub compliance levels
const COMPLIANCE_LEVELS = {
  strict: {
    allowedCritical: 0,
    allowedHigh: 0,
    allowedMedium: 0,
    allowedLow: 0
  },
  standard: {
    allowedCritical: 0,
    allowedHigh: 5,
    allowedMedium: 20,
    allowedLow: 50
  },
  development: {
    allowedCritical: 0,
    allowedHigh: 10,
    allowedMedium: 50,
    allowedLow: 100
  }
};

// Infrastructure violation patterns for any hub
const VIOLATION_PATTERNS = {
  critical: [
    { pattern: /axios\.create\(/g, message: 'Use @tamyla/shared/api (ApiClient) instead of custom axios instances' },
    { pattern: /XMLHttpRequest/g, message: 'Use @tamyla/shared/api (ApiClient) instead of XMLHttpRequest' },
    { pattern: /new EventTarget\(\)/g, message: 'Use @tamyla/shared/events (EventBus) instead of custom event systems' },
    { pattern: /class\s+\w*EventManager/g, message: 'Use @tamyla/shared/events (EventBus) instead of custom event managers' }
  ],
  high: [
    { pattern: /localStorage\.(getItem|setItem|removeItem)/g, message: 'Use @tamyla/shared/auth (AuthService) for storage operations' },
    { pattern: /sessionStorage\.(getItem|setItem|removeItem)/g, message: 'Use @tamyla/shared/auth (AuthService) for storage operations' },
    { pattern: /fetch\s*\(/g, message: 'Use @tamyla/shared/api (ApiClient) methods instead of raw fetch()' },
    { pattern: /new AbortController\(\)/g, message: 'Use @tamyla/shared/api (ApiClient) built-in cancellation' }
  ],
  medium: [
    { pattern: /console\.(log|info|warn|error|debug)/g, message: 'Use @tamyla/shared/utils (Logger) instead of console.*' }
  ],
  low: [
    { pattern: /catch\s*\(\s*error?\s*\)\s*\{[^}]*\}/g, message: 'Use @tamyla/shared/utils (ErrorHandler) for consistent error handling' },
    { pattern: /throw\s+new\s+Error\(/g, message: 'Consider using @tamyla/shared/utils (ErrorHandler) for error creation' }
  ]
};

// File patterns to exclude from scanning
const EXCLUDED_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /\.min\.js$/,
  /\.map$/,
  /test/,
  /tests/,
  /spec/,
  /__tests__/,
  /\.test\./,
  /\.spec\./,
  /backup/,
  /\.backup/,
  /temp/,
  /tmp/
];

class HubComplianceValidator {
  constructor(options = {}) {
    this.options = {
      hubName: options.hub,
      failOnViolations: options.failOnViolations || false,
      complianceLevel: options.complianceLevel || 'standard',
      verbose: options.verbose || false,
      outputFile: options.outputFile,
      allHubs: options.allHubs || false,
      ...options
    };
    
    this.violations = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    this.hubPaths = [];
    this.discoveredHubs();
  }

  discoveredHubs() {
    // Navigate from packages/shared/scripts back to project root, then to packages
    const projectRoot = path.resolve(__dirname, '../../..');
    const packagesDir = path.join(projectRoot, 'packages');
    
    if (this.options.allHubs) {
      // Scan all hub directories
      if (fs.existsSync(packagesDir)) {
        const packages = fs.readdirSync(packagesDir);
        this.hubPaths = packages
          .filter(pkg => pkg.endsWith('-hub'))
          .map(pkg => path.join(packagesDir, pkg));
      }
    } else if (this.options.hubName) {
      // Single hub validation
      const hubPath = path.join(packagesDir, this.options.hubName);
      if (fs.existsSync(hubPath)) {
        this.hubPaths = [hubPath];
      } else {
        console.error(`❌ Hub not found: ${this.options.hubName}`);
        process.exit(1);
      }
    } else {
      console.error('❌ Must specify --hub=<hub-name> or --all-hubs');
      process.exit(1);
    }

    if (this.hubPaths.length === 0) {
      console.error('❌ No hubs found for validation');
      process.exit(1);
    }
  }

  async validate() {
    console.log('🔍 HUB INFRASTRUCTURE COMPLIANCE VALIDATION\n');
    
    let totalViolations = 0;
    const hubResults = [];

    for (const hubPath of this.hubPaths) {
      const hubName = path.basename(hubPath);
      console.log(`🏗️ Validating ${hubName}...`);
      
      const hubViolations = await this.validateHub(hubPath);
      const hubTotal = Object.values(hubViolations).reduce((sum, arr) => sum + arr.length, 0);
      
      hubResults.push({
        hubName,
        violations: hubViolations,
        total: hubTotal,
        compliant: this.isCompliant(hubViolations)
      });
      
      totalViolations += hubTotal;
      
      this.reportHubViolations(hubName, hubViolations);
    }

    this.reportSummary(hubResults, totalViolations);
    
    if (this.options.outputFile) {
      this.saveReport(hubResults);
    }

    // Determine exit code based on compliance
    const hasFailures = hubResults.some(result => !result.compliant);
    if (this.options.failOnViolations && hasFailures) {
      console.log('\n❌ Build FAILED due to compliance violations');
      process.exit(1);
    }

    return hubResults;
  }

  async validateHub(hubPath) {
    const violations = { critical: [], high: [], medium: [], low: [] };
    
    const files = this.scanHubFiles(hubPath);
    
    for (const filePath of files) {
      const relativePath = path.relative(hubPath, filePath);
      const fileViolations = this.scanFile(filePath, relativePath);
      
      Object.keys(violations).forEach(severity => {
        violations[severity].push(...fileViolations[severity]);
      });
    }
    
    return violations;
  }

  scanHubFiles(hubPath) {
    const files = [];
    
    const scanDirectory = (dir) => {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Check both absolute and relative paths for exclusions
          const relativePath = path.relative(process.cwd(), fullPath);
          const dirName = path.basename(fullPath);
          const shouldExclude = EXCLUDED_PATTERNS.some(pattern => 
            pattern.test(relativePath) || pattern.test(dirName) || pattern.test(fullPath)
          );
          
          if (!shouldExclude) {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          const shouldInclude = /\.(js|jsx|ts|tsx)$/.test(entry);
          const relativePath = path.relative(process.cwd(), fullPath);
          const shouldExclude = EXCLUDED_PATTERNS.some(pattern => pattern.test(relativePath));
          
          if (shouldInclude && !shouldExclude) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scanDirectory(hubPath);
    return files;
  }

  scanFile(filePath, relativePath) {
    const violations = { critical: [], high: [], medium: [], low: [] };
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      Object.keys(VIOLATION_PATTERNS).forEach(severity => {
        VIOLATION_PATTERNS[severity].forEach(({ pattern, message }) => {
          lines.forEach((line, index) => {
            const matches = line.match(pattern);
            if (matches) {
              violations[severity].push({
                file: relativePath,
                line: index + 1,
                code: line.trim(),
                message,
                severity
              });
            }
          });
        });
      });
    } catch (error) {
      console.warn(`⚠️ Could not scan file: ${relativePath}`);
    }
    
    return violations;
  }

  isCompliant(violations) {
    const limits = COMPLIANCE_LEVELS[this.options.complianceLevel];
    
    return (
      violations.critical.length <= limits.allowedCritical &&
      violations.high.length <= limits.allowedHigh &&
      violations.medium.length <= limits.allowedMedium &&
      violations.low.length <= limits.allowedLow
    );
  }

  reportHubViolations(hubName, violations) {
    const total = Object.values(violations).reduce((sum, arr) => sum + arr.length, 0);
    
    if (total === 0) {
      console.log(`   ✅ ${hubName}: COMPLIANT (0 violations)\n`);
      return;
    }

    console.log(`   🚨 ${hubName}: ${total} violations found`);
    console.log(`   🔴 Critical: ${violations.critical.length}`);
    console.log(`   🟠 High: ${violations.high.length}`);
    console.log(`   🟡 Medium: ${violations.medium.length}`);
    console.log(`   🔵 Low: ${violations.low.length}`);
    
    if (this.options.verbose) {
      Object.keys(violations).forEach(severity => {
        if (violations[severity].length > 0) {
          console.log(`\n   ${this.getSeverityEmoji(severity)} ${severity.toUpperCase()} violations:`);
          violations[severity].slice(0, 5).forEach(violation => {
            console.log(`     📁 ${violation.file}:${violation.line}`);
            console.log(`     ❌ ${violation.code}`);
            console.log(`     ✅ ${violation.message}\n`);
          });
          
          if (violations[severity].length > 5) {
            console.log(`     ... and ${violations[severity].length - 5} more\n`);
          }
        }
      });
    }
    
    console.log();
  }

  getSeverityEmoji(severity) {
    const emojis = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };
    return emojis[severity] || '⚪';
  }

  reportSummary(hubResults, totalViolations) {
    console.log('📋 COMPLIANCE SUMMARY\n');
    
    const compliantHubs = hubResults.filter(result => result.compliant);
    const nonCompliantHubs = hubResults.filter(result => !result.compliant);
    
    console.log(`✅ Compliant hubs: ${compliantHubs.length}/${hubResults.length}`);
    console.log(`❌ Non-compliant hubs: ${nonCompliantHubs.length}/${hubResults.length}`);
    console.log(`📊 Total violations: ${totalViolations}`);
    console.log(`🎯 Compliance level: ${this.options.complianceLevel}`);
    
    if (nonCompliantHubs.length > 0) {
      console.log('\n❌ NON-COMPLIANT HUBS:');
      nonCompliantHubs.forEach(result => {
        console.log(`   ${result.hubName}: ${result.total} violations`);
      });
    }
    
    if (compliantHubs.length > 0) {
      console.log('\n✅ COMPLIANT HUBS:');
      compliantHubs.forEach(result => {
        console.log(`   ${result.hubName}: Clean ✨`);
      });
    }
    
    console.log(`\n🚀 Fix violations using @tamyla/shared infrastructure`);
    console.log(`📖 See migration guide: packages/<hub>/docs/MIGRATION_GUIDE.md`);
  }

  saveReport(hubResults) {
    const report = {
      timestamp: new Date().toISOString(),
      complianceLevel: this.options.complianceLevel,
      hubResults,
      summary: {
        totalHubs: hubResults.length,
        compliantHubs: hubResults.filter(r => r.compliant).length,
        totalViolations: hubResults.reduce((sum, r) => sum + r.total, 0)
      }
    };
    
    fs.writeFileSync(this.options.outputFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: ${this.options.outputFile}`);
  }
}

// CLI Interface
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--hub=')) {
      options.hub = arg.split('=')[1];
    } else if (arg === '--fail-on-violations') {
      options.failOnViolations = true;
    } else if (arg === '--all-hubs') {
      options.allHubs = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--strict') {
      options.complianceLevel = 'strict';
    } else if (arg === '--development') {
      options.complianceLevel = 'development';
    } else if (arg.startsWith('--output=')) {
      options.outputFile = arg.split('=')[1];
    }
  });
  
  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  const validator = new HubComplianceValidator(options);
  
  validator.validate().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = { HubComplianceValidator, VIOLATION_PATTERNS, COMPLIANCE_LEVELS };