"use client";

import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useWallet, UseWalletReturn } from '@/hooks/useWallet';
import { useAuth } from '@/contexts/AuthContext';

interface WalletContextType extends UseWalletReturn { }

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const wallet = useWallet();
    const { user, isAuthenticated } = useAuth();
    const lastUserEmailRef = useRef<string | null>(null);
    const isInitialMountRef = useRef(true);

    // Refetch wallet khi user thay đổi (login/logout/switch account)
    useEffect(() => {
        const currentUserEmail = user?.email || null;

        // Bỏ qua lần đầu mount (useWallet đã tự fetch)
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            lastUserEmailRef.current = currentUserEmail;
            // Nếu đã có user ngay từ đầu, không cần refetch
            if (isAuthenticated && currentUserEmail) {
                return;
            }
        }

        // Nếu user email thay đổi hoặc authentication state thay đổi
        if (lastUserEmailRef.current !== currentUserEmail) {
            if (isAuthenticated && currentUserEmail) {
                // User đã đăng nhập hoặc switch account, refetch wallet để lấy số tiền đúng
                // Dùng setTimeout để đảm bảo user đã được set hoàn toàn
                setTimeout(() => {
                    wallet.refetch().catch((err) => {
                        console.error('Error refetching wallet:', err);
                    });
                }, 100);
            } else if (!isAuthenticated) {
                // User đã logout, clear wallet state ngay lập tức
                wallet.reset();
            }
        }

        // Cập nhật ref
        lastUserEmailRef.current = currentUserEmail;
    }, [user?.email, isAuthenticated]); // Không thêm wallet.refetch vào dependency để tránh loop

    // Polling để tự động refetch wallet balance mỗi 5 giây khi user đang authenticated
    useEffect(() => {
        if (!isAuthenticated || !user?.email) {
            return;
        }

        const intervalId = setInterval(() => {
            wallet.refetch().catch((err) => {
                console.error('Error refetching wallet:', err);
            });
        }, 5000);

        return () => clearInterval(intervalId);
    }, [isAuthenticated, user?.email, wallet.refetch]);

    // Listen for custom event để refetch wallet ngay lập tức khi có transaction
    useEffect(() => {
        if (!isAuthenticated || !user?.email) {
            return;
        }

        const handleWalletUpdate = () => {
            wallet.refetch().catch((err) => {
                console.error('Error refetching wallet:', err);
            });
        };

        window.addEventListener('wallet:update', handleWalletUpdate);
        return () => window.removeEventListener('wallet:update', handleWalletUpdate);
    }, [isAuthenticated, user?.email, wallet.refetch]);

    return (
        <WalletContext.Provider value={wallet}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWalletContext(): WalletContextType {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWalletContext must be used within a WalletProvider');
    }
    return context;
}

