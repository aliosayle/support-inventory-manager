
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
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
  supabaseUser: SupabaseUser | null;
  session: Session | null;
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
  supabaseUser: null,
  session: null,
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
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async () => {
    if (!supabaseUser) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setUser({
          ...data,
          created_at: new Date(data.created_at),
        });
      }
    } catch (err) {
      console.error('Error in refreshProfile:', err);
    }
  };

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Set up auth listener
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          await refreshProfile();
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      });
      
      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        await refreshProfile();
      }
      
      setIsLoading(false);
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
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
      supabaseUser,
      session,
      isLoading,
      error,
      login,
      signup,
      logout,
      isAuthenticated: !!session,
      hasRole,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
