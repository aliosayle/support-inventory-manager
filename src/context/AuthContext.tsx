
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  created_at: Date;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  hasRole: () => false,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to convert string role to UserRole type
  const validateUserRole = (role: string): UserRole => {
    if (role === 'admin' || role === 'employee' || role === 'user') {
      return role as UserRole;
    }
    // Default to 'user' if the role is invalid
    return 'user';
  };

  const refreshProfile = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('custom_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: validateUserRole(data.role),
          department: data.department,
          avatar: data.avatar,
          created_at: new Date(data.created_at),
        });
      }
    } catch (err) {
      console.error('Error in refreshProfile:', err);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      setIsLoading(true);
      
      const userId = localStorage.getItem('userId');
      if (userId) {
        await refreshProfile();
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Handle demo emails
      const normalizedEmail = email.includes('@example.com') 
        ? email.replace('@example.com', '@gmail.com') 
        : email;

      // In a real app, we would hash the password and compare with the stored hash
      // For demo purposes, we're directly comparing with the password_hash field
      // where all demo accounts have password='password'
      
      const { data, error } = await supabase
        .from('custom_users')
        .select('*')
        .eq('email', normalizedEmail)
        .single();
      
      if (error) {
        throw new Error('User not found');
      }
      
      // In a real app we would verify the password hash here
      // For demo purposes, we're just checking if password equals 'password'
      if (password !== 'password') {
        throw new Error('Invalid password');
      }
      
      // Store user ID in localStorage for session management
      localStorage.setItem('userId', data.id);
      
      // Set user data with validated role
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: validateUserRole(data.role),
        department: data.department,
        avatar: data.avatar,
        created_at: new Date(data.created_at),
      });
      
      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Login failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Handle demo emails
      const normalizedEmail = email.includes('@example.com') 
        ? email.replace('@example.com', '@gmail.com') 
        : email;
      
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('custom_users')
        .select('id')
        .eq('email', normalizedEmail)
        .single();
      
      if (existingUser) {
        throw new Error('User already exists. Please login instead.');
      }
      
      // In a real app, we would hash the password first
      // For demo purposes, we're storing a fake hash
      const passwordHash = '$2a$10$b8Ycw7tIHgsfoLHyYQ.YaOG45hR1askYWQuALEbTZ9bR6T1qsQzLa'; // Pretend hash of 'password'
      
      // Create the new user
      const { data, error } = await supabase
        .from('custom_users')
        .insert({
          email: normalizedEmail,
          password_hash: passwordHash,
          name,
          role: 'user', // Default role
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Store user ID in localStorage for session management
      localStorage.setItem('userId', data.id);
      
      // Set user data with validated role
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: validateUserRole(data.role),
        department: data.department,
        avatar: data.avatar,
        created_at: new Date(data.created_at),
      });
      
      toast({
        title: "Account created",
        description: "You have successfully signed up.",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Signup failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear the user ID from localStorage
      localStorage.removeItem('userId');
      
      // Clear user state
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "There was a problem logging out.",
        variant: "destructive",
      });
    }
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
      signup,
      logout,
      isAuthenticated: !!user,
      hasRole,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
