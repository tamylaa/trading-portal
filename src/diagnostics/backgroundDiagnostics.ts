interface DiagnosticLog {
    message: string;
    timestamp: number;
    critical: boolean;
}

const runBackgroundDiagnostics = (): DiagnosticLog[] => {
    const logs: DiagnosticLog[] = [];

    function logIssue(message: string, isCritical = false): void {
        console.debug(`[Background Diagnostic] ${message}`);
        logs.push({
            message,
            timestamp: Date.now(),
            critical: isCritical
        });
        
        // Use React's environment variable pattern
        if (process.env.NODE_ENV === 'development' && isCritical) {
            console.warn(`[Critical Issue] ${message}`);
        }
    }

    async function checkAsset(path: string): Promise<boolean> {
        try {
            const response = await fetch(path, { method: 'HEAD' });
            if (!response.ok) {
                logIssue(`Asset ${path} failed to load: ${response.status}`, true);
                return false;
            }
            return true;
        } catch (error) {
            logIssue(`Asset ${path} error: ${(error as Error).message}`, true);
            return false;
        }
    }

    // Run checks in background
    Promise.all([
        checkAsset('/sidebar/sidebar.html'),
        checkAsset('/footer/footer.html'),
        checkAsset('/sidebar/sidebar.css'),
        checkAsset('/footer/footer.css')
    ]);

    function checkRendering(): void {
        const criticalElements = [
            '.sidebar',
            '.footer',
            'header',
            'main'
        ];

        criticalElements.forEach(selector => {
            if (!document.querySelector(selector)) {
                logIssue(`Missing element: ${selector}`, true);
            }
        });
    }

    setTimeout(() => {
        checkRendering();
    }, 2000);

    return logs;
};

export default runBackgroundDiagnostics;
