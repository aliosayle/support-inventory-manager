
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  requireAuth?: boolean;
  requiredRoles?: string[];
}

const MainLayout = ({ requireAuth = true, requiredRoles = [] }: MainLayoutProps) => {
  const { isAuthenticated, hasRole, hasPermission, isLoading, user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

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

  // Permission-based redirects
  if (user) {
    // Redirect from dashboard if user doesn't have view_reports permission
    if (location.pathname === '/dashboard' && !hasPermission('view_reports') && !hasRole('admin')) {
      return <Navigate to="/issues" replace />;
    }
    
    // Redirect from reports if user doesn't have view_reports permission
    if (location.pathname === '/reports' && !hasPermission('view_reports') && !hasRole('admin')) {
      return <Navigate to="/issues" replace />;
    }
    
    // Redirect from users if user doesn't have manage_users permission
    if (location.pathname === '/users' && !hasPermission('manage_users') && !hasRole('admin')) {
      return <Navigate to="/issues" replace />;
    }
    
    // Redirect from new user form if user doesn't have manage_users permission
    if (location.pathname === '/users/new' && !hasPermission('manage_users') && !hasRole('admin')) {
      return <Navigate to="/issues" replace />;
    }
    
    // Redirect from edit user form if user doesn't have manage_users permission
    if (location.pathname.startsWith('/users/') && location.pathname.includes('/edit') 
        && !hasPermission('manage_users') && !hasRole('admin')) {
      return <Navigate to="/issues" replace />;
    }

    // Redirect from issues page if user doesn't have view_issues permission
    if (location.pathname === '/issues' && !hasPermission('view_issues') && !hasRole('admin')) {
      return <Navigate to="/dashboard" replace />;
    }
    
    // Redirect from new issue page if user doesn't have create_issue permission
    if (location.pathname === '/issues/new' && !hasPermission('create_issue') && !hasRole('admin')) {
      return <Navigate to="/issues" replace />;
    }
    
    // Redirect from issue detail if user doesn't have view_issues permission
    if (location.pathname.startsWith('/issues/') && !hasPermission('view_issues') && !hasRole('admin')) {
      return <Navigate to="/dashboard" replace />;
    }
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
