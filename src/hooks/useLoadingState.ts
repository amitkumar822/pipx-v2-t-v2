import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

export const useLoadingState = (initialState: LoadingState = {}) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(initialState);

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const withLoading = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setLoading(key, true);
    try {
      return await asyncFn();
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    withLoading,
  };
};

export default useLoadingState;