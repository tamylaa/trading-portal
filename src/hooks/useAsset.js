import { useState, useEffect } from 'react';
import { assetLoader } from '../utils/assetLoader';
import { useAppDispatch } from '../contexts/AppContext';

export function useAsset(src, options = {}) {
    const [asset, setAsset] = useState(null);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const dispatch = useAppDispatch();

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // ms

    useEffect(() => {
        let mounted = true;
        let timeoutId;

        async function loadAsset() {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });
                const loaded = await assetLoader.loadImage(src, {
                    ...options,
                    priority: retryCount > 0 ? 'high' : options.priority
                });
                
                if (mounted) {
                    setAsset(loaded);
                    setError(null);
                    setRetryCount(0);
                }
            } catch (err) {
                if (mounted) {
                    setError(err);
                    dispatch({ type: 'SET_ERROR', payload: err.message });
                    
                    if (retryCount < MAX_RETRIES) {
                        timeoutId = setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                        }, RETRY_DELAY * Math.pow(2, retryCount));
                    }
                }
            } finally {
                if (mounted) {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            }
        }

        loadAsset();

        return () => {
            mounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [src, options, dispatch, retryCount]);

    return { 
        asset, 
        error,
        isRetrying: retryCount > 0,
        retryCount,
        reset: () => setRetryCount(0)
    };
}