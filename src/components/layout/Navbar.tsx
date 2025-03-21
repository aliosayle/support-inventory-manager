import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Navbar = ({ isSidebarOpen, toggleSidebar }: NavbarProps) => {
  const { user, logout } = useAuth();
  const [unreadNotifications] = useState(3);

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center border-b bg-background px-4">
      <div className="flex flex-1 items-center gap-4">
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
      
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button variant="ghost" size="icon">
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadNotifications}
              </div>
            )}
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to="/profile" className="w-full h-full block">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
