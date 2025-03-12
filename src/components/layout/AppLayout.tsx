
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />
        
        <main 
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out overflow-y-auto",
            sidebarCollapsed ? "ml-[60px]" : "ml-[240px]"
          )}
        >
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
