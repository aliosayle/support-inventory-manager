
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { users } from '@/utils/mockData';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  hasRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, we would validate the password too
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${foundUser.name}!`,
      });
    } catch (err) {
      setError((err as Error).message);
      toast({
        title: "Login failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  // Helper to check if user has a specific role
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      login,
      logout,
      isAuthenticated: !!user,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
