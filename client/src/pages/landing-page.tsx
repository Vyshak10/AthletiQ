import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 to-blue-600 h-screen flex items-center">
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl text-white"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">
                LaunchWaitlist
              </span>
              <span className="block mt-2">Tournament Management</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Streamline your sports tournament management with our powerful platform. 
              Create, manage, and track tournaments with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/tournaments')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/login')}
                    variant="outline"
                  >
                    Login
                  </Button>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/signup')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Tournament Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your sports tournaments in one place
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Create Tournaments</h3>
              <p className="text-gray-600">Set up tournaments with custom settings and formats</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Manage Teams</h3>
              <p className="text-gray-600">Add teams and players, manage rosters efficiently</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Track Matches</h3>
              <p className="text-gray-600">Schedule matches and update scores in real-time</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          
          <p className="text-xl mb-10 max-w-3xl mx-auto text-blue-100">
            Join us today and start managing your tournaments with ease
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!user && (
              <Button 
                size="lg" 
                onClick={() => navigate('/signup')}
                className="bg-primary hover:bg-primary/90"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}