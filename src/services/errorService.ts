export const errorService = {
    logError: (error: Error, context: string) => {
        console.error(`[${context}] Error:`, error);
        // Add error reporting service integration here if needed
    }
};