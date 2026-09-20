import React, { useState, ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

interface MainLayoutProps {
  children: ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function MainLayout({ children, currentPath, onNavigate }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6faff] text-[#141d23] grid-bg flex font-sans">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        currentPath={currentPath}
        onNavigate={onNavigate}
      />
      <div className="app-main">
        <TopBar 
          onMenuClick={() => setSidebarOpen(true)} 
          currentPath={currentPath}
        />
        <main className="flex-1 px-6 py-6 max-w-[1400px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
