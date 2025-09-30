import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard sidebar and header will go here */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
