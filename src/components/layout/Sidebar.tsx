
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Package, Users, BarChart, ShoppingCart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  isOpen: boolean;
}

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isOpen: boolean;
}

const SidebarItem = ({ to, icon: Icon, label, isOpen }: SidebarItemProps) => {
  return (
    <li>
      {isOpen ? (
        <NavLink
          to={to}
          className={({ isActive }) => 
            cn(
              "flex items-center gap-3 py-2 px-3 rounded-md transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent"
            )
          }
        >
          <Icon size={20} />
          <span className="font-medium animate-fade-in">{label}</span>
        </NavLink>
      ) : (
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <NavLink
                to={to}
                className={({ isActive }) => 
                  cn(
                    "flex items-center justify-center p-2 rounded-md transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent"
                  )
                }
              >
                <Icon size={20} />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </li>
  );
};

const Sidebar = ({ isOpen }: SidebarProps) => {
  const { hasRole, logout } = useAuth();
  
  const adminLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/issues', icon: ClipboardList, label: 'Issues' },
    { to: '/stock', icon: Package, label: 'Stock' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/reports', icon: BarChart, label: 'Reports' },
    { to: '/purchase-requests', icon: ShoppingCart, label: 'Purchase Requests' },
  ];
  
  const employeeLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/issues', icon: ClipboardList, label: 'Issues' },
    { to: '/stock', icon: Package, label: 'Stock' },
    { to: '/purchase-requests', icon: ShoppingCart, label: 'Purchase Requests' },
  ];
  
  const userLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/issues', icon: ClipboardList, label: 'Issues' },
    { to: '/purchase-requests', icon: ShoppingCart, label: 'Purchase Requests' },
  ];
  
  let links = userLinks;
  
  if (hasRole('admin')) {
    links = adminLinks;
  } else if (hasRole('employee')) {
    links = employeeLinks;
  }

  return (
    <aside 
      className={cn(
        "border-r h-screen bg-sidebar flex flex-col z-20 transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center h-16 border-b px-3">
        {isOpen && (
          <span className="text-xl font-semibold animate-fade-in">
            IT Support
          </span>
        )}
      </div>
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <ul className="space-y-2">
          {links.map((link) => (
            <SidebarItem 
              key={link.to} 
              to={link.to} 
              icon={link.icon} 
              label={link.label} 
              isOpen={isOpen} 
            />
          ))}
        </ul>
      </nav>
      <div className="mt-auto border-t py-4 px-3">
        {isOpen ? (
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={logout}
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={logout}
                >
                  <LogOut size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Logout
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
