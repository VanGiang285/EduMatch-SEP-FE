"use client";

import { useState, useEffect, useCallback } from 'react';
import { WalletService } from '@/services/walletService';
import { WalletDto } from '@/types/backend';
import { ErrorHandler } from '@/lib/error-handler';

export interface UseWalletReturn {
  balance: number;
  wallet: WalletDto | null;
  loading: boolean;
  error: any | null;
  refetch: () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<WalletDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await WalletService.getWalletBalance();
      
      if (response.success && response.data) {
        setWallet(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch wallet balance');
      }
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      setError(appError);
      ErrorHandler.logError(err, 'useWallet.fetchWallet');
      setWallet(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const refetch = useCallback(async () => {
    await fetchWallet();
  }, [fetchWallet]);

  return {
    balance: wallet?.balance ?? 0,
    wallet,
    loading,
    error,
    refetch,
  };
}

