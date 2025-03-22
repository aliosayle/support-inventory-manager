
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';

interface MainLayoutProps {
  requireAuth?: boolean;
  requiredRoles?: string[];
}

const MainLayout = ({ requireAuth = true, requiredRoles = [] }: MainLayoutProps) => {
  const { isAuthenticated, hasRole, hasPermission, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Update sidebar state based on device size
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  // Close sidebar on route change if mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Handle permission-based redirects
  useEffect(() => {
    if (isLoading || isRedirecting || !user) {
      return;
    }

    // Define a redirect handler to avoid duplication
    const handleUnauthorizedAccess = (targetPath: string, message: string) => {
      if (location.pathname !== targetPath) {
        setIsRedirecting(true);
        toast({
          title: "Access Denied",
          description: message,
          variant: "destructive",
        });
        navigate(targetPath, { replace: true });
      }
    };

    // Check permissions for various routes
    if (location.pathname === '/dashboard' && !hasPermission('view_reports') && !hasRole(['admin'])) {
      handleUnauthorizedAccess('/issues', "You don't have permission to view the dashboard.");
      return;
    }
    
    if (location.pathname === '/reports' && !hasPermission('view_reports') && !hasRole(['admin'])) {
      handleUnauthorizedAccess('/issues', "You don't have permission to view reports.");
      return;
    }
    
    if ((location.pathname === '/users' || location.pathname === '/users/new' || 
        (location.pathname.startsWith('/users/') && location.pathname.includes('/edit'))) && 
        !hasPermission('manage_users') && !hasRole(['admin'])) {
      handleUnauthorizedAccess('/issues', "You don't have permission to manage users.");
      return;
    }

    if (location.pathname === '/issues' && !hasPermission('view_issues') && !hasRole(['admin'])) {
      handleUnauthorizedAccess('/dashboard', "You don't have permission to view issues.");
      return;
    }
    
    if (location.pathname === '/issues/new' && !hasPermission('create_issue') && !hasRole(['admin'])) {
      handleUnauthorizedAccess('/issues', "You don't have permission to create issues.");
      return;
    }
    
    if (location.pathname.startsWith('/issues/') && location.pathname !== '/issues/new' && 
        !hasPermission('view_issues') && !hasRole(['admin'])) {
      handleUnauthorizedAccess('/dashboard', "You don't have permission to view issue details.");
      return;
    }

    // Reset redirecting state if no redirects needed
    if (isRedirecting) {
      setIsRedirecting(false);
    }
  }, [location.pathname, isLoading, user, hasRole, hasPermission, navigate, isRedirecting]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Auth check
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  // Role check for protected routes
  if (requireAuth && requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role as any))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* Fixed sidebar */}
      {isAuthenticated && <Sidebar isOpen={isSidebarOpen} />}
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 overflow-hidden",
          isMobile
            ? "ml-0" // No margin on mobile
            : (isSidebarOpen ? "ml-64" : "ml-16") // Account for sidebar width
        )}
      >
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 p-4 animate-fade-in overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
