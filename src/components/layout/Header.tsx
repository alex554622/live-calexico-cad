
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user } = useAuth();
  
  return (
    <header className="h-14 border-b bg-background flex items-center px-4 sticky top-0 z-10">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="font-semibold">Calexico Police CAD</div>
      
      <div className="ml-auto flex items-center space-x-2">
        {user && (
          <span className="text-sm text-muted-foreground">
            {user.name || user.email}
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;
