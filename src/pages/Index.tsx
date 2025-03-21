
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('login');

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Handle demo emails
      const normalizedEmail = email.includes('@example.com') 
        ? email.replace('@example.com', '@gmail.com') 
        : email;
        
      await login(normalizedEmail, password);
      navigate('/dashboard');
    } catch (error) {
      // Error already handled in auth context
      console.log('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!name || !email || !password) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        return;
      }
      
      // Handle demo emails
      const normalizedEmail = email.includes('@example.com') 
        ? email.replace('@example.com', '@gmail.com') 
        : email;
      
      await signup(normalizedEmail, password, name);
      navigate('/dashboard');
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoUserIfNeeded = async (email: string, password: string, name: string, role: string, department?: string) => {
    setIsLoading(true);
    
    try {
      // For demo purposes, directly set these values
      setEmail(email);
      setPassword('password'); // All demo users have password='password'
      
      // Check if demo user already exists
      const normalizedEmail = email.replace('@example.com', '@gmail.com');
      
      const { data: existingUser } = await supabase
        .from('custom_users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();
        
      if (!existingUser) {
        console.log('Demo user does not exist, creating:', email);
        
        // Create the demo user if it doesn't exist
        const passwordHash = '$2a$10$b8Ycw7tIHgsfoLHyYQ.YaOG45hR1askYWQuALEbTZ9bR6T1qsQzLa'; // Pretend hash of 'password'
        
        const { error } = await supabase
          .from('custom_users')
          .insert({
            email: normalizedEmail,
            password_hash: passwordHash,
            name,
            role,
            department
          });
          
        if (error) {
          console.error('Error creating demo user:', error);
          throw new Error(`Failed to create demo user: ${error.message}`);
        }
        
        console.log('Demo user created successfully');
      } else {
        console.log('Demo user already exists:', existingUser);
      }
      
      // Now try to log in
      try {
        await login(normalizedEmail, 'password');
        navigate('/dashboard');
      } catch (loginError) {
        console.error('Error logging in with demo user:', loginError);
        toast({
          title: "Demo Login Error",
          description: "Could not log in with the demo account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error with demo user:", error);
      toast({
        title: "Error With Demo User",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">IT Support Manager</h1>
          <p className="text-muted-foreground">Login or signup to access the dashboard</p>
        </div>
        
        <div className="space-y-6 bg-card rounded-lg border p-6 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Signup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">Email</label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium">Password</label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-center">Demo Accounts</h3>
            <div className="grid gap-2">
              <Button 
                variant="outline" 
                onClick={() => createDemoUserIfNeeded('admin@example.com', 'password', 'Admin User', 'admin', 'IT Department')}
                disabled={isLoading}
              >
                Admin Account
              </Button>
              <Button 
                variant="outline" 
                onClick={() => createDemoUserIfNeeded('john@example.com', 'password', 'John Smith', 'employee', 'IT Support')}
                disabled={isLoading}
              >
                Employee Account
              </Button>
              <Button 
                variant="outline" 
                onClick={() => createDemoUserIfNeeded('michael@example.com', 'password', 'Michael Johnson', 'user', 'Marketing')}
                disabled={isLoading}
              >
                User Account
              </Button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          For demo purposes, all accounts use the password "password".
        </p>
      </div>
    </div>
  );
};

export default Index;
