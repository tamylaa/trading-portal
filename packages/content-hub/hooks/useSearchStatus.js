import { useState, useEffect, useCallback } from 'react';

export const useSearchStatus = (config) => {
  const [status, setStatus] = useState({
    type: 'idle',
    message: config.idleMessage || 'Ready to search'
  });

  const updateStatus = useCallback((newStatus) => {
    setStatus(newStatus);
  }, []);

  const showLoadingStatus = useCallback((message) => {
    setStatus({
      type: 'loading',
      message: message || 'Searching...'
    });
  }, []);

  const showSuccessStatus = useCallback((message, resultCount) => {
    const resultText = resultCount !== undefined
      ? `Found ${resultCount} result${resultCount !== 1 ? 's' : ''}`
      : message || 'Search completed successfully';

    setStatus({
      type: 'success',
      message: resultText
    });
  }, []);

  const showErrorStatus = useCallback((message, error) => {
    setStatus({
      type: 'error',
      message: message || error?.message || 'Search failed'
    });
  }, []);

  const showEmptyStatus = useCallback((message) => {
    setStatus({
      type: 'empty',
      message: message || 'No results found'
    });
  }, []);

  const resetStatus = useCallback(() => {
    setStatus({
      type: 'idle',
      message: config.idleMessage || 'Ready to search'
    });
  }, [config.idleMessage]);

  // Auto-reset status after specified duration for non-error states
  useEffect(() => {
    if (status.type === 'success' && config.autoResetDelay) {
      const timer = setTimeout(() => {
        resetStatus();
      }, config.autoResetDelay);

      return () => clearTimeout(timer);
    }
  }, [status.type, config.autoResetDelay, resetStatus]);

  return {
    status,
    updateStatus,
    showLoadingStatus,
    showSuccessStatus,
    showErrorStatus,
    showEmptyStatus,
    resetStatus,
  };
};