
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header toggleSidebar={toggleSidebar} />
      
      {/* Theme toggle positioned in the top-right corner */}
      <div className={cn(
        "absolute top-4 z-50",
        isMobile ? "right-14" : "right-4"
      )}>
        <ThemeToggle />
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />
        
        <main 
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out overflow-y-auto",
            isMobile ? 
              (sidebarCollapsed ? "ml-[60px]" : "ml-0") : 
              (sidebarCollapsed ? "ml-[60px]" : "ml-[240px]")
          )}
        >
          <div className={cn(
            "mx-auto px-4 py-6",
            isMobile ? "container-fluid" : "container"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
