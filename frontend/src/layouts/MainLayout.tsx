import React, { useState, ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6faff] text-[#141d23] grid-bg flex font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-6 py-6 max-w-[1400px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
