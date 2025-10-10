
import { useState, useCallback, useRef, useEffect } from 'react';
import { ErrorHandler } from '@/lib/error-handler';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: any | null;
}

interface AsyncActions<T> {
  execute: (...args: any[]) => Promise<T | undefined>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: any | null) => void;
}

interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  onFinally?: () => void;
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): AsyncState<T> & AsyncActions<T> {
  const {
    immediate = false,
    onSuccess,
    onError,
    onFinally,
    retry = false,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      if (!isMountedRef.current) return;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunction(...args);
        
        if (isMountedRef.current) {
          setState(prev => ({ ...prev, data: result, loading: false }));
          onSuccess?.(result);
        }
        
        return result;
      } catch (error) {
        if (!isMountedRef.current) return;

        const appError = ErrorHandler.handleApiError(error);
        
        if (retry && retryCountRef.current < retryCount) {
          retryCountRef.current++;
          setTimeout(() => {
            if (isMountedRef.current) {
              execute(...args);
            }
          }, retryDelay * Math.pow(2, retryCountRef.current - 1));
          return;
        }

        setState(prev => ({ ...prev, error: appError, loading: false }));
        onError?.(appError);
        ErrorHandler.logError(error, 'useAsync');
      } finally {
        if (isMountedRef.current) {
          onFinally?.();
        }
      }
    },
    [asyncFunction, onSuccess, onError, onFinally, retry, retryCount, retryDelay]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
    retryCountRef.current = 0;
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: any | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

export function useAsyncSubmit<T = any>(
  submitFunction: (data: any) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const asyncState = useAsync(submitFunction, options);

  const handleSubmit = useCallback(
    async (data: any) => {
      return await asyncState.execute(data);
    },
    [asyncState.execute]
  );

  return {
    ...asyncState,
    handleSubmit,
  };
}

export function useAsyncFetch<T = any>(
  fetchFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> & { deps?: any[] } = {}
) {
  const { deps = [], ...asyncOptions } = options;
  
  const asyncState = useAsync(fetchFunction, {
    immediate: true,
    ...asyncOptions,
  });

  const refetch = useCallback(
    (...args: any[]) => {
      return asyncState.execute(...args);
    },
    [asyncState.execute]
  );

  useEffect(() => {
    if (deps.length > 0) {
      refetch();
    }
  }, deps);

  return {
    ...asyncState,
    refetch,
  };
}
