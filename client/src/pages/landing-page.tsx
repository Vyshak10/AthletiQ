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
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Background SVG pattern with sports elements */}
        <div className="absolute inset-0 overflow-hidden opacity-15">
          <svg className="h-full w-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sportPattern" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="scale(2) rotate(0)">
                {/* Soccer ball */}
                <circle cx="5" cy="5" r="2" fill="white" />
                <path d="M3 5 L7 5 M5 3 L5 7" stroke="white" strokeWidth="0.5" />
                
                {/* Basketball */}
                <circle cx="15" cy="15" r="2" fill="white" />
                <path d="M13 15 C14 13, 16 13, 17 15" stroke="white" strokeWidth="0.5" fill="none" />
                <path d="M13 15 C14 17, 16 17, 17 15" stroke="white" strokeWidth="0.5" fill="none" />
                
                {/* Tennis */}
                <circle cx="15" cy="5" r="1.5" fill="none" stroke="white" strokeWidth="0.5" />
                
                {/* Baseball */}
                <path d="M3 13 C3 17, 7 17, 7 13 Z" stroke="white" strokeWidth="0.5" fill="none" />
                <path d="M3 13 L7 17 M7 13 L3 17" stroke="white" strokeWidth="0.3" />
              </pattern>
            </defs>
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
                SportSync
              </span>
              <span className="block mt-2">Tournament Management</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              From soccer to basketball, manage any sport tournament with live scoring, 
              team tracking, and real-time statistics that keep fans engaged
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
              All-in-One Sports Tournament Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From grassroots leagues to professional tournaments, SportSync handles it all with powerful features designed for every sport
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Trophy className="h-10 w-10 text-yellow-500" />}
              title="Tournament Creation"
              description="Create brackets, round-robins, or custom formats for any sport with flexible rules and divisions"
            />
            <FeatureCard 
              icon={<Users className="h-10 w-10 text-blue-600" />}
              title="Team & Player Management"
              description="Build rosters, assign positions, track player stats and manage substitutions in real-time"
            />
            <FeatureCard 
              icon={<Activity className="h-10 w-10 text-green-600" />}
              title="Live Scoring & Updates"
              description="Capture goals, points, fouls and key moments as they happen with instant leaderboard updates"
            />
            <FeatureCard 
              icon={<Calendar className="h-10 w-10 text-purple-600" />}
              title="Smart Scheduling"
              description="Auto-generate match schedules across multiple venues with conflict detection and optimal timing"
            />
          </div>

          {/* Additional sports specific details */}
          <div className="mt-20 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Multi-Sport Support</h3>
              <p className="text-gray-600 mb-6">
                Whether it's soccer, basketball, volleyball, tennis, or any team sport - SportSync adapts to your specific needs with specialized statistics tracking and gameplay features.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded-full mr-3 mt-1">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Custom statistics for each sport type</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded-full mr-3 mt-1">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Sport-specific scorekeeping interfaces</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded-full mr-3 mt-1">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Customizable tournament formats per sport</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-100 rounded-lg p-4 text-center">
                  <span className="block text-3xl font-bold text-blue-700">⚽</span>
                  <span className="text-blue-800 font-medium">Soccer</span>
                </div>
                <div className="bg-orange-100 rounded-lg p-4 text-center">
                  <span className="block text-3xl font-bold text-orange-700">🏀</span>
                  <span className="text-orange-800 font-medium">Basketball</span>
                </div>
                <div className="bg-green-100 rounded-lg p-4 text-center">
                  <span className="block text-3xl font-bold text-green-700">🎾</span>
                  <span className="text-green-800 font-medium">Tennis</span>
                </div>
                <div className="bg-purple-100 rounded-lg p-4 text-center">
                  <span className="block text-3xl font-bold text-purple-700">🏐</span>
                  <span className="text-purple-800 font-medium">Volleyball</span>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-yellow-400 text-blue-900 rounded-full shadow-lg px-3 py-2 font-bold text-sm transform rotate-12">
                And many more!
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white relative overflow-hidden">
        {/* Sport balls animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-yellow-400 animate-bounce" style={{animationDuration: '4s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-green-400 animate-bounce" style={{animationDuration: '3s', animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-10 h-10 rounded-full bg-red-400 animate-bounce" style={{animationDuration: '5s', animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-10 right-20 w-14 h-14 rounded-full bg-purple-400 animate-bounce" style={{animationDuration: '4.5s', animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block mb-8 bg-blue-800/50 px-6 py-2 rounded-full text-sm font-semibold text-yellow-300 border border-blue-500">
            Currently serving 1,000+ tournaments across 30+ sports
          </div>
        
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to <span className="text-yellow-400">Revolutionize</span> Your Sports Events?
          </h2>
          
          <p className="text-xl mb-10 max-w-3xl mx-auto text-blue-100">
            Join sports organizers worldwide who are creating exceptional tournament experiences with our powerful platform
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/auth">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-8 py-6 text-lg">
                Get Started Free <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                Book a Demo
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-blue-200">No credit card required • Free plan available • Set up in minutes</p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-white">
                <span className="text-yellow-400">Sport</span>Sync
              </span>
            </div>
            <div className="flex flex-wrap gap-4 md:gap-6">
              <a href="#" className="hover:text-yellow-400 transition-colors">About</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Features</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Pricing</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Contact</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Terms</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} SportSync Tournament Management Platform. All rights reserved.
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