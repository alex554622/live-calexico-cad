
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTouchDevice } from '@/hooks/use-touch-device';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const isTouchDevice = useTouchDevice();
  
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
    <div className={cn(
      "min-h-screen flex flex-col bg-background",
      isTouchDevice && "touch-device"
    )}>
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
            "flex-1 transition-all duration-300 ease-in-out",
            // Apply proper layout on mobile
            isMobile ? 
              (sidebarCollapsed ? "ml-[60px]" : "ml-0") : 
              (sidebarCollapsed ? "ml-[60px]" : "ml-[240px]"),
            // Ensure proper scrolling on mobile
            "overflow-y-auto h-[calc(100vh-3.5rem)]",
            // Add padding to prevent content from being hidden under fixed elements
            "pb-16"
          )}
        >
          <div className={cn(
            "mx-auto px-4 py-6",
            isMobile ? "w-full" : "container",
            // Add padding to prevent content from being hidden under fixed elements
            isMobile ? "pb-20" : "pb-6"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
