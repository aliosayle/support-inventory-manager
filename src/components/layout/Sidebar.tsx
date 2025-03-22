
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { ClipboardList, Package, Users, BarChart, ShoppingCart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Permission, UserRole } from '@/types';

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
  const { hasRole, hasPermission, logout, user } = useAuth();
  
  // Define links with required permissions
  const links = [
    { to: '/dashboard', icon: BarChart, label: 'Dashboard', requiredPermission: 'view_reports' as Permission, requiredRoles: ['admin', 'employee'] as UserRole[] },
    { to: '/issues', icon: ClipboardList, label: 'Issues', requiredPermission: null, requiredRoles: [] as UserRole[] }, // Allow all users to see Issues
    { to: '/stock', icon: Package, label: 'Stock', requiredPermission: null, requiredRoles: ['admin', 'employee'] as UserRole[] },
    { to: '/users', icon: Users, label: 'Users', requiredPermission: 'manage_users' as Permission, requiredRoles: ['admin'] as UserRole[] },
    { to: '/reports', icon: BarChart, label: 'Reports', requiredPermission: 'view_reports' as Permission, requiredRoles: ['admin'] as UserRole[] },
    { to: '/purchase-requests', icon: ShoppingCart, label: 'Purchase Requests', requiredPermission: null, requiredRoles: ['admin', 'employee', 'user'] as UserRole[] },
  ];
  
  // Filter links based on user permissions and roles
  const filteredLinks = links.filter(link => {
    // If this is the issues link, always show it if user is logged in
    if (link.to === '/issues' && user) {
      return true;
    }
    
    // Check if user has the required permission (if specified)
    const hasRequiredPermission = link.requiredPermission 
      ? hasPermission(link.requiredPermission) 
      : true;
      
    // Check if user has one of the required roles
    const hasRequiredRole = link.requiredRoles.length > 0
      ? link.requiredRoles.some(role => hasRole(role))
      : true;
      
    return hasRequiredPermission && hasRequiredRole;
  });

  return (
    <aside 
      className={cn(
        "fixed h-screen border-r bg-sidebar flex flex-col z-20 transition-all duration-300 ease-in-out",
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
          {filteredLinks.map((link) => (
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
