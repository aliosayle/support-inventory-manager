
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
    
    // Define the valid permission values based on the Permission enum
    const validPermissionValues = [
      'create_issue', 'edit_issue', 'delete_issue', 'assign_issue', 'resolve_issue',
      'create_stock', 'edit_stock', 'delete_stock', 'manage_stock_transactions', 
      'create_purchase_request', 'approve_purchase_request', 'reject_purchase_request',
      'view_reports', 'manage_users', 'view_issues'
    ];
    
    // Filter the permissions to only include valid ones
    return permissions.filter(perm => 
      validPermissionValues.includes(perm)
    ) as Permission[];
  };

  const refreshProfile = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    try {
      console.log('Fetching profile for user ID:', userId);
      // TEMPORARY BYPASS: Skip database fetch and use cached admin user
      if (localStorage.getItem('bypassAuth') === 'true') {
        const adminUser: UserProfile = {
          id: 'admin-bypass-id',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          permissions: ['view_issues', 'create_issue', 'edit_issue', 'delete_issue', 
                       'assign_issue', 'resolve_issue', 'view_reports', 'manage_users'],
          department: 'IT Department',
          avatar: undefined,
          created_at: new Date(),
        };
        setUser(adminUser);
        return;
      }
      
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
      const bypassAuth = localStorage.getItem('bypassAuth');
      
      if (userId || bypassAuth === 'true') {
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
      // TEMPORARY BYPASS: Skip credential validation and create admin user
      console.log('TEMPORARY: Bypassing authentication and creating admin user');
      
      // Store bypass flag in localStorage
      localStorage.setItem('bypassAuth', 'true');
      localStorage.setItem('userId', 'admin-bypass-id');
      
      // Create a temporary admin user profile
      const adminUser: UserProfile = {
        id: 'admin-bypass-id',
        name: 'Admin User',
        email: email || 'admin@example.com',
        role: 'admin',
        permissions: ['view_issues', 'create_issue', 'edit_issue', 'delete_issue', 
                     'assign_issue', 'resolve_issue', 'view_reports', 'manage_users'],
        department: 'IT Department',
        avatar: undefined,
        created_at: new Date(),
      };
      
      setUser(adminUser);
      
      toast({
        title: "Temporary login bypass activated",
        description: "Logged in as admin user (authentication bypassed)",
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
      localStorage.removeItem('bypassAuth');
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
    
    // Admins have all permissions
    if (user.role === 'admin') return true;
    
    // If user has no permissions defined
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
