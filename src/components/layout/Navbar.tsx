
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, Menu, Search, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Navbar = ({ toggleSidebar, isSidebarOpen }: NavbarProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 transition-all duration-300 ease-in-out">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="shrink-0"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <div className="text-xl font-medium hidden sm:block">
            IT Department
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-4 transition-all duration-300",
          showSearch ? "flex-1 md:flex-none" : ""
        )}>
          {showSearch ? (
            <div className="w-full max-w-md flex items-center">
              <Input
                type="search"
                placeholder="Search..."
                className="w-full"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(false)}
                className="ml-2"
              >
                <X size={18} />
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(true)}
              >
                <Search size={18} />
              </Button>
              
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Bell size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No new notifications
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar>
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>{user?.name ? getInitials(user.name) : "??"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>Profile</DropdownMenuItem>
                    <DropdownMenuItem disabled>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="default" size="sm">
                    Login
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
