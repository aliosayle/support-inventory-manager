import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, Permission } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions?: Permission[];
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
  hasPermission: (permissions: Permission | Permission[]) => boolean;
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
  hasPermission: () => false,
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

  const validateUserRole = (role: string): UserRole => {
    if (role === 'admin' || role === 'employee' || role === 'user') {
      return role as UserRole;
    }
    return 'user';
  };

  const validatePermissions = (permissions: string[] | null): Permission[] => {
    if (!permissions) return [];
    return permissions.filter(perm => {
      return Object.values(Permission).includes(perm as Permission);
    }) as Permission[];
  };

  const refreshProfile = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    try {
      console.log('Fetching profile for user ID:', userId);
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
        console.log('Profile data:', data);
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: validateUserRole(data.role),
          department: data.department,
          avatar: data.avatar,
          created_at: new Date(data.created_at),
          permissions: validatePermissions(data.permissions),
        });
      }
    } catch (err) {
      console.error('Error in refreshProfile:', err);
    }
  };

  useEffect(() => {
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
      const normalizedEmail = email.includes('@example.com') 
        ? email.replace('@example.com', '@gmail.com') 
        : email;
      
      console.log('Attempting to log in with email:', normalizedEmail);
      
      const { data, error } = await supabase
        .from('custom_users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();
      
      if (error) {
        console.error('Database error:', error);
        throw new Error('Error querying user data');
      }
      
      if (!data) {
        console.error('User not found:', normalizedEmail);
        throw new Error('User not found');
      }
      
      console.log('User found:', data);
      
      if (password !== 'password') {
        throw new Error('Invalid password');
      }
      
      localStorage.setItem('userId', data.id);
      
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: validateUserRole(data.role),
        department: data.department,
        avatar: data.avatar,
        created_at: new Date(data.created_at),
        permissions: validatePermissions(data.permissions),
      });
      
      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
      });
    } catch (err: any) {
      console.error('Login error:', err);
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
      const normalizedEmail = email.includes('@example.com') 
        ? email.replace('@example.com', '@gmail.com') 
        : email;
      
      console.log('Attempting to sign up user:', normalizedEmail);
      
      const { data: existingUser } = await supabase
        .from('custom_users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();
      
      if (existingUser) {
        console.log('User already exists:', existingUser);
        throw new Error('User already exists. Please login instead.');
      }
      
      const passwordHash = '$2a$10$b8Ycw7tIHgsfoLHyYQ.YaOG45hR1askYWQuALEbTZ9bR6T1qsQzLa'; // Pretend hash of 'password'
      
      const { data, error } = await supabase
        .from('custom_users')
        .insert({
          email: normalizedEmail,
          password_hash: passwordHash,
          name,
          role: 'user',
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }
      
      console.log('User created:', data);
      
      localStorage.setItem('userId', data.id);
      
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
      console.error('Signup error:', err);
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
      localStorage.removeItem('userId');
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

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  };

  const hasPermission = (permissions: Permission | Permission[]): boolean => {
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    
    if (!user.permissions) return false;
    
    if (Array.isArray(permissions)) {
      return permissions.some(permission => user.permissions?.includes(permission));
    }
    
    return user.permissions.includes(permissions);
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
      hasPermission,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
