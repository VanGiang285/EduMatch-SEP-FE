import { useState, useCallback, useRef } from 'react';
interface LoadingState {
  loading: boolean;
  error: any | null;
}
interface LoadingActions {
  setLoading: (loading: boolean) => void;
  setError: (error: any | null) => void;
  execute: <T>(asyncFn: () => Promise<T>) => Promise<T | undefined>;
  reset: () => void;
}
export function useLoading(initialLoading = false): LoadingState & LoadingActions {
  const [state, setState] = useState<LoadingState>({
    loading: initialLoading,
    error: null,
  });
  const isMountedRef = useRef(true);
  const setLoading = useCallback((loading: boolean) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, loading }));
    }
  }, []);
  const setError = useCallback((error: any | null) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, error }));
    }
  }, []);
  const execute = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
    if (!isMountedRef.current) return;
    setState({ loading: true, error: null });
    try {
      const result = await asyncFn();
      if (isMountedRef.current) {
        setState({ loading: false, error: null });
      }
      return result;
    } catch (error) {
      if (isMountedRef.current) {
        setState({ loading: false, error });
      }
      throw error;
    }
  }, []);
  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setState({ loading: false, error: null });
    }
  }, []);
  return {
    ...state,
    setLoading,
    setError,
    execute,
    reset,
  };
}
export function useMultipleLoading(keys: string[]) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );
  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  }, []);
  const execute = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>
  ): Promise<T | undefined> => {
    setLoading(key, true);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);
  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);
  const isAnyLoading = Object.values(loadingStates).some(loading => loading);
  return {
    loadingStates,
    setLoading,
    execute,
    isLoading,
    isAnyLoading,
  };
}
export function useDebouncedLoading(delay = 300) {
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const setLoadingDebounced = useCallback((isLoading: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isLoading) {
      setLoading(true);
    } else {
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
      }, delay);
    }
  }, [delay]);
  return {
    loading,
    setLoading: setLoadingDebounced,
  };
}