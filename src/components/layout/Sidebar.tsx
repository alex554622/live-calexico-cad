
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Bell, 
  Settings,
  Menu,
  X,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTouchDevice } from '@/hooks/use-touch-device';
import { useAuth } from '@/context/AuthContext';

export function Sidebar({ collapsed, setCollapsed }: { 
  collapsed: boolean; 
  setCollapsed: (collapsed: boolean) => void;
}) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isTouchDevice = useTouchDevice();
  const { user } = useAuth();
  
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Officers', path: '/officers' },
    { icon: FileText, label: 'Incidents', path: '/incidents' },
    { icon: Calendar, label: 'Scheduling', path: '/scheduling' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];
  
  if (!user) return null;
  
  return (
    <div 
      className={cn(
        "group flex flex-col h-full border-r bg-background transition-all duration-300 z-20",
        collapsed ? "w-[60px]" : "w-[240px]",
        isMobile && !collapsed ? "absolute left-0 top-0 h-screen shadow-lg" : "",
        isTouchDevice ? "-webkit-tap-highlight-color-transparent" : ""
      )}
    >
      <div className="flex items-center justify-between px-4 h-14">
        {!collapsed && (
          <div className="font-semibold text-lg">Calexico CAD</div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            collapsed ? "mx-auto" : "",
            isTouchDevice ? "min-h-10 active:opacity-70" : ""
          )}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className={cn(
        "flex-1 overflow-y-auto py-4",
        isTouchDevice ? "-webkit-overflow-scrolling-touch overscroll-behavior-y-contain" : ""
      )}>
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center py-2 px-3 rounded-md transition-all",
                isActivePath(item.path) 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "hover:bg-accent text-muted-foreground hover:text-foreground",
                collapsed && "justify-center px-0",
                isTouchDevice && "active:bg-accent/70 min-h-[44px]"
              )}
              onClick={() => isMobile && setCollapsed(true)}
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
