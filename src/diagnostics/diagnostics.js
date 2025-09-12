document.addEventListener('DOMContentLoaded', () => {
    const diagnosticMessage = document.getElementById('diagnostic-message');
    const logs = [];

    function logIssue(message, isCritical = false) {
        console.log(`[Diagnostic] ${message}`);
        logs.push(message);
        if (isCritical) {
            diagnosticMessage.textContent = `Issue detected: ${message} Please contact support at info@globaltradesolutions.com.`;
            diagnosticMessage.style.display = 'block';
        }
    }

    // 1. Check Viewport Meta Tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta || !viewportMeta.content.includes('width=device-width')) {
        logIssue('Viewport meta tag missing or misconfigured', true);
    } else {
        logIssue('Viewport meta tag OK');
    }

    // 2. Check Asset Loading
    async function checkAsset(path) {
        try {
            const response = await fetch(path, { method: 'HEAD' });
            if (!response.ok) {
                logIssue(`Asset ${path} failed to load: ${response.status}`, true);
                return false;
            }
            logIssue(`Asset ${path} loaded OK`);
            return true;
        } catch (error) {
            logIssue(`Asset ${path} error: ${error.message}`, true);
            return false;
        }
    }

    Promise.all([
        checkAsset('/sidebar/sidebar.html'),
        checkAsset('/footer/footer.html'),
        checkAsset('/sidebar/sidebar.css'),
        checkAsset('/footer/footer.css')
    ]).then(results => {
        if (results.every(result => result)) {
            logIssue('All assets loaded successfully');
        }
    });

    // 3. Test DNS Resolution
    async function checkDNS() {
        try {
            // Use a known endpoint (Google) to test network
            const response = await fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors' });
            logIssue('Network connectivity OK');
        } catch (error) {
            logIssue('Network/DNS issue detected: Unable to reach external site', true);
        }
    }
    checkDNS();

    // 4. Check Mobile Rendering
    function checkRendering() {
        const isMobile = window.innerWidth <= 768;
        const sidebar = document.querySelector('.sidebar') || document.querySelector('.sidebar-fallback');
        const footer = document.querySelector('.footer') || document.querySelector('.footer-fallback');
        const header = document.querySelector('header');
        const main = document.querySelector('main');

        if (!header || !main || !sidebar || !footer) {
            logIssue('Critical elements missing (header, main, sidebar, or footer)', true);
        } else {
            logIssue('All critical elements present');
        }

        if (isMobile) {
            const sidebarDisplay = window.getComputedStyle(sidebar).transform;
            if (sidebarDisplay !== 'matrix(1, 0, 0, 1, -250, 0)' && !sidebar.classList.contains('active')) {
                logIssue('Sidebar not hidden off-screen on mobile', true);
            } else {
                logIssue('Sidebar rendering OK on mobile');
            }

            const footerContainer = document.querySelector('.footer-container') || document.querySelector('.footer-fallback');
            const footerGrid = window.getComputedStyle(footerContainer).gridTemplateColumns;
            if (!footerGrid.includes('1fr') || footerGrid.includes('minmax')) {
                logIssue('Footer not stacking correctly on mobile', true);
            } else {
                logIssue('Footer rendering OK on mobile');
            }
        }
    }
    checkRendering();

    // 5. Log Device Info
    const deviceInfo = {
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        isMobile: window.innerWidth <= 768,
        browser: navigator.vendor || navigator.userAgent
    };
    logIssue(`Device Info: ${JSON.stringify(deviceInfo)}`);

    // 6. Summarize
    setTimeout(() => {
        console.log('[Diagnostic Summary]', logs.join('\n'));
        if (!diagnosticMessage.textContent) {
            diagnosticMessage.textContent = 'All checks passed! If issues persist, contact support.';
            diagnosticMessage.style.background = '#ccffcc';
            diagnosticMessage.style.display = 'block';
            setTimeout(() => {
                diagnosticMessage.style.display = 'none';
            }, 3000);
        }
    }, 2000);
});