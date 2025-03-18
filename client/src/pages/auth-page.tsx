import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, RegisterCredentials, LoginCredentials } from '@/hooks/use-auth';
import { FcGoogle } from 'react-icons/fc';
import { Mail, Lock, User } from 'lucide-react';

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  // Form states
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  
  const [registerCredentials, setRegisterCredentials] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  // Redirect to home if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginCredentials);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerCredentials);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left column - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome to SportSync
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your all-in-one tournament management platform
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Sign in to your SportSync account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username or Email</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="username"
                          name="username"
                          type="text"
                          placeholder="username or email"
                          className="pl-10"
                          value={loginCredentials.username}
                          onChange={handleLoginChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={loginCredentials.password}
                          onChange={handleLoginChange}
                        />
                      </div>
                    </div>
                    {loginMutation.isError && (
                      <div className="text-sm text-red-500">
                        {loginMutation.error?.message || 'Login failed'}
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Register for a SportSync account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="name"
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10"
                          value={registerCredentials.name}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="username"
                          name="username"
                          type="text"
                          placeholder="johndoe"
                          className="pl-10"
                          value={registerCredentials.username}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10"
                          value={registerCredentials.email}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="register-password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={registerCredentials.password}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="confirm-password"
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={registerCredentials.confirmPassword}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    {registerMutation.isError && (
                      <div className="text-sm text-red-500">
                        {registerMutation.error?.message || 'Registration failed'}
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right column - Hero section */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/80 to-primary items-center justify-center p-8">
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-6">
            Manage Sports Tournaments with Ease
          </h1>
          <ul className="space-y-4">
            <li className="flex items-center gap-2">
              • Real-time match updates and statistics
            </li>
            <li className="flex items-center gap-2">
              • Comprehensive team and player management
            </li>
            <li className="flex items-center gap-2">
              • Multi-sport tournament support
            </li>
            <li className="flex items-center gap-2">
              • Live leaderboards and analytics
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}