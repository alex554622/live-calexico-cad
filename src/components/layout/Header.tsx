
import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <header className="h-14 border-b bg-background flex items-center px-4 sticky top-0 z-10">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className={cn("font-semibold", isMobile ? "text-sm truncate" : "")}>
        Calexico Police CAD
      </div>
      
      <div className="ml-auto flex items-center space-x-2">
        {user && (
          <>
            {!isMobile && (
              <span className="text-sm text-muted-foreground">
                {user.name || user.username}
              </span>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        )}
        {!isMobile && <ThemeToggle />}
      </div>
    </header>
  );
};

export default Header;
