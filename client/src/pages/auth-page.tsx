import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { FcGoogle } from 'react-icons/fc';

export default function AuthPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !loading) {
      setLocation('/dashboard');
    }
  }, [user, loading, setLocation]);

  if (loading) {
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

          <div className="mt-8 space-y-6">
            <Button
              onClick={signInWithGoogle}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-6"
            >
              <FcGoogle className="w-6 h-6" />
              <span>Sign in with Google</span>
            </Button>
          </div>
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