
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
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
          <p className="text-muted-foreground">Login to access the dashboard</p>
        </div>
        
        <div className="space-y-6 bg-card rounded-lg border p-6 shadow-sm">
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
          
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-center">Demo Accounts</h3>
            <div className="grid gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEmail('admin@example.com');
                  setPassword('password');
                }}
              >
                Admin Account
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEmail('john@example.com');
                  setPassword('password');
                }}
              >
                Employee Account
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEmail('michael@example.com');
                  setPassword('password');
                }}
              >
                User Account
              </Button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          For demo purposes, any password will work with these email addresses.
        </p>
      </div>
    </div>
  );
};

export default Index;
