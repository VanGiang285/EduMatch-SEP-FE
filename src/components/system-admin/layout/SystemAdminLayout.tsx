"use client";

import React from 'react';
import { SystemAdminNavbar } from './SystemAdminNavbar';

interface SystemAdminLayoutProps {
  children: React.ReactNode;
  onNavigate?: (screen: string) => void;
}

export function SystemAdminLayout({ children, onNavigate }: SystemAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SystemAdminNavbar onNavigate={onNavigate} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

