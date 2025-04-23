import { useState, useEffect } from 'react';
import { assetLoader } from '../utils/assetLoader';
import { useAppDispatch } from '../contexts/AppContext';

export function useAsset(src, options = {}) {
    const {
        maxRetries = 3,
        retryDelay = 1000,
        ...restOptions
    } = options;
    const [asset, setAsset] = useState(null);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const dispatch = useAppDispatch();

    useEffect(() => {
        let mounted = true;
        let timeoutId;

        async function loadAsset() {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });
                const loaded = await assetLoader.loadImage(src, {
                    ...restOptions,
                    priority: retryCount > 0 ? 'high' : restOptions.priority
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
                    
                    if (retryCount < maxRetries) {
                        timeoutId = setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                        }, retryDelay * Math.pow(2, retryCount));
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