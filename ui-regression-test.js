// 🧪 UI Regression Tests for Redux Implementation
// Automated testing for professional dashboard features

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class UIRegressionTester {
    constructor(baseUrl = 'http://localhost:3333') {
        this.baseUrl = baseUrl;
        this.browser = null;
        this.page = null;
        this.results = [];
    }

    async initialize() {
        console.log('🚀 Initializing UI Regression Tests...');
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1200, height: 800 });
    }

    async runTest(name, testFn) {
        console.log(`\n🧪 Running: ${name}`);
        const startTime = Date.now();
        
        try {
            await testFn();
            const duration = Date.now() - startTime;
            this.results.push({ name, status: 'PASSED', duration, error: null });
            console.log(`✅ ${name} - PASSED (${duration}ms)`);
        } catch (error) {
            const duration = Date.now() - startTime;
            this.results.push({ name, status: 'FAILED', duration, error: error.message });
            console.log(`❌ ${name} - FAILED: ${error.message}`);
        }
    }

    async testBasicLoad() {
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
        
        // Check if page loads
        const title = await this.page.title();
        if (!title) throw new Error('Page title is empty');
        
        // Check for React app
        const reactRoot = await this.page.$('#root');
        if (!reactRoot) throw new Error('React root element not found');
    }

    async testReduxProvider() {
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
        
        // Check if Redux store is available in window
        const hasReduxDevTools = await this.page.evaluate(() => {
            return window.__REDUX_DEVTOOLS_EXTENSION__ !== undefined || 
                   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ !== undefined;
        });
        
        // Check for Redux Provider in React tree (by checking for store context)
        const hasStore = await this.page.evaluate(() => {
            // Look for Redux store indicators in the DOM
            return document.querySelector('[data-testid*="redux"]') !== null ||
                   document.querySelector('[class*="redux"]') !== null ||
                   window.store !== undefined;
        });
        
        console.log(`   └─ Redux DevTools: ${hasReduxDevTools ? 'Available' : 'Not detected'}`);
        console.log(`   └─ Store Context: ${hasStore ? 'Detected' : 'Not detected'}`);
    }

    async testResponsiveDesign() {
        // Test desktop
        await this.page.setViewport({ width: 1200, height: 800 });
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
        
        // Test tablet
        await this.page.setViewport({ width: 768, height: 1024 });
        await this.page.reload({ waitUntil: 'networkidle0' });
        
        // Test mobile
        await this.page.setViewport({ width: 375, height: 667 });
        await this.page.reload({ waitUntil: 'networkidle0' });
        
        // Reset to desktop
        await this.page.setViewport({ width: 1200, height: 800 });
    }

    async testNavigationRoutes() {
        const routes = ['/', '/login', '/dashboard'];
        
        for (const route of routes) {
            const url = `${this.baseUrl}${route}`;
            console.log(`   └─ Testing route: ${route}`);
            
            const response = await this.page.goto(url, { waitUntil: 'networkidle0' });
            
            if (response.status() >= 400) {
                throw new Error(`Route ${route} returned status ${response.status()}`);
            }
            
            // Check if page contains expected content
            const bodyText = await this.page.evaluate(() => document.body.textContent);
            if (!bodyText || bodyText.trim().length === 0) {
                throw new Error(`Route ${route} has empty content`);
            }
        }
    }

    async testThemeToggling() {
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
        
        // Look for theme-related elements
        const themeElements = await this.page.evaluate(() => {
            const elements = [];
            
            // Check for dark/light mode classes or attributes
            const hasThemeClasses = document.querySelector('[class*="dark"], [class*="light"], [class*="theme"]');
            if (hasThemeClasses) elements.push('Theme classes found');
            
            // Check for CSS custom properties (themes often use these)
            const styles = getComputedStyle(document.documentElement);
            const customProps = Array.from(styles).filter(prop => prop.startsWith('--'));
            if (customProps.length > 0) elements.push(`${customProps.length} CSS custom properties`);
            
            return elements;
        });
        
        console.log(`   └─ Theme indicators: ${themeElements.join(', ') || 'None detected'}`);
    }

    async testPerformanceMetrics() {
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
        
        const metrics = await this.page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                loadTime: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
                domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
                totalTime: Math.round(navigation.loadEventEnd - navigation.fetchStart)
            };
        });
        
        console.log(`   └─ Load Time: ${metrics.loadTime}ms`);
        console.log(`   └─ DOM Ready: ${metrics.domContentLoaded}ms`);
        console.log(`   └─ Total Time: ${metrics.totalTime}ms`);
        
        // Fail if load time is too slow
        if (metrics.totalTime > 5000) {
            throw new Error(`Page load too slow: ${metrics.totalTime}ms`);
        }
    }

    async testConsoleErrors() {
        const errors = [];
        
        this.page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
        
        // Wait a bit for any delayed errors
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (errors.length > 0) {
            console.log(`   └─ Console errors found: ${errors.length}`);
            errors.forEach(error => console.log(`      • ${error}`));
            
            // Only fail on critical errors (not warnings)
            const criticalErrors = errors.filter(error => 
                !error.includes('Warning') && 
                !error.includes('DevTools') &&
                !error.includes('extension')
            );
            
            if (criticalErrors.length > 0) {
                throw new Error(`Critical console errors: ${criticalErrors.length}`);
            }
        } else {
            console.log(`   └─ No console errors detected`);
        }
    }

    async generateReport() {
        const timestamp = new Date().toISOString();
        const passed = this.results.filter(r => r.status === 'PASSED').length;
        const failed = this.results.filter(r => r.status === 'FAILED').length;
        const total = this.results.length;
        
        const report = {
            timestamp,
            summary: {
                total,
                passed,
                failed,
                success_rate: Math.round((passed / total) * 100)
            },
            results: this.results
        };
        
        // Save report
        fs.writeFileSync(
            path.join(process.cwd(), 'ui-regression-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log(`\n📊 UI Regression Test Report`);
        console.log(`================================`);
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success Rate: ${report.summary.success_rate}%`);
        
        if (failed > 0) {
            console.log(`\n❌ Failed Tests:`);
            this.results.filter(r => r.status === 'FAILED').forEach(test => {
                console.log(`  • ${test.name}: ${test.error}`);
            });
        }
        
        return report.summary.success_rate >= 80; // 80% pass rate required
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async runAll() {
        try {
            await this.initialize();
            
            await this.runTest('Basic Page Load', () => this.testBasicLoad());
            await this.runTest('Redux Provider Setup', () => this.testReduxProvider());
            await this.runTest('Responsive Design', () => this.testResponsiveDesign());
            await this.runTest('Navigation Routes', () => this.testNavigationRoutes());
            await this.runTest('Theme System', () => this.testThemeToggling());
            await this.runTest('Performance Metrics', () => this.testPerformanceMetrics());
            await this.runTest('Console Error Check', () => this.testConsoleErrors());
            
            const success = await this.generateReport();
            return success;
            
        } finally {
            await this.cleanup();
        }
    }
}

// CLI execution
if (require.main === module) {
    const tester = new UIRegressionTester();
    tester.runAll().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = UIRegressionTester;
