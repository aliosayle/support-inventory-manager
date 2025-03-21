
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  requireAuth?: boolean;
  requiredRoles?: string[];
}

const MainLayout = ({ requireAuth = true, requiredRoles = [] }: MainLayoutProps) => {
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check window size and update sidebar state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role check
  if (requireAuth && requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role as any))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="flex min-h-screen w-full">
      {isAuthenticated && <Sidebar isOpen={isSidebarOpen} />}
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          isSidebarOpen ? "ml-0 md:ml-64" : "ml-0 md:ml-16"
        )}
      >
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 p-6 animate-fade-in overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
