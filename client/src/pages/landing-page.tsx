import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, Activity, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Sports Background */}
      <div className="relative bg-gradient-to-br from-blue-900 to-blue-600 h-screen flex items-center">
        {/* Semi-transparent overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Background SVG pattern with sports elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <pattern id="sportPattern" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="scale(2) rotate(0)">
              <circle cx="1" cy="1" r="1.5" fill="white" />
              <path d="M5 5 L8 8 M2 8 L8 2" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#sportPattern)" />
          </svg>
        </div>
        
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
                Sports Tournament Management
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Organize, track, and enjoy sports tournaments with professional-grade tools and real-time updates
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold">
                  Get Started <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Sports Tournament Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides comprehensive tools to create unforgettable sporting experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Trophy className="h-10 w-10 text-blue-600" />}
              title="Tournament Creation"
              description="Easily set up tournaments for any sport with customizable formats, divisions, and rules"
            />
            <FeatureCard 
              icon={<Users className="h-10 w-10 text-blue-600" />}
              title="Team Management"
              description="Register teams, manage rosters, and track player statistics throughout the tournament"
            />
            <FeatureCard 
              icon={<Activity className="h-10 w-10 text-blue-600" />}
              title="Live Scoring"
              description="Real-time score updates and statistics for all matches keep everyone informed"
            />
            <FeatureCard 
              icon={<Calendar className="h-10 w-10 text-blue-600" />}
              title="Scheduling"
              description="Intelligent scheduling tools to create efficient match timelines and venue allocation"
            />
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Tournaments?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of sports organizers who are creating exceptional tournament experiences
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold">
              Sign Up Now <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-white">SportsManager</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} Sports Tournament Management. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}