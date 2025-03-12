
import React from 'react';
import { 
  Home, 
  Users, 
  Bell, 
  Map, 
  AlertTriangle, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const menuItems = [
  { 
    icon: Home, 
    label: 'Dashboard', 
    path: '/',
    exact: true
  },
  { 
    icon: AlertTriangle, 
    label: 'Incidents', 
    path: '/incidents' 
  },
  { 
    icon: Users, 
    label: 'Officers', 
    path: '/officers' 
  },
  { 
    icon: Map, 
    label: 'Map', 
    path: '/map' 
  },
  { 
    icon: Bell, 
    label: 'Notifications', 
    path: '/notifications' 
  },
  { 
    icon: Settings, 
    label: 'Settings', 
    path: '/settings' 
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const location = useLocation();
  
  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col bg-sidebar h-full transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <h1 className={cn(
          "text-sidebar-foreground font-bold transition-opacity",
          isOpen ? "opacity-100" : "opacity-0"
        )}>
          Calexico Live
        </h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggle} 
          className="text-sidebar-foreground hover:text-white hover:bg-sidebar-accent"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link 
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  isActive(item.path, item.exact) 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  "ml-3 transition-opacity", 
                  isOpen ? "opacity-100" : "opacity-0"
                )}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border text-sidebar-foreground">
        <div className={cn(
          "text-xs transition-opacity", 
          isOpen ? "opacity-100" : "opacity-0"
        )}>
          © 2025 Calexico PD
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
