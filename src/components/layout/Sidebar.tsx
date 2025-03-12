
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Shield, 
  AlertTriangle, 
  Bell,
  Settings,
  Users
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    requiresPermission: false
  },
  {
    title: 'Officers',
    href: '/officers',
    icon: Shield,
    requiresPermission: false
  },
  {
    title: 'Incidents',
    href: '/incidents',
    icon: AlertTriangle,
    requiresPermission: false
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    requiresPermission: false
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    requiresPermission: true,
    permission: 'manageSettings' as Permission
  },
  {
    title: 'User Management',
    href: '/users',
    icon: Users,
    requiresPermission: true,
    permission: 'manageSettings' as Permission
  }
];

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const location = useLocation();
  const { hasPermission } = useAuth();
  
  return (
    <div className="pb-12 w-full">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">
            Calexico PD
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => {
              // Skip items that require permissions the user doesn't have
              if (item.requiresPermission && item.permission && !hasPermission(item.permission)) {
                return null;
              }
              
              return (
                <Button
                  key={item.href}
                  variant={location.pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    location.pathname === item.href && "bg-police"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
