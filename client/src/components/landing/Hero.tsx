import { Button } from "@/components/ui/button";
import { Play, ShieldCheck, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-12">
          <motion.div 
            className="lg:w-1/2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-primary text-sm font-medium">
              Coming Soon
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Revolutionize Your Workflow with LaunchPad
            </h1>
            <p className="text-lg text-gray-600 md:pr-10">
              The all-in-one solution that transforms how teams collaborate, innovate, and deliver results. Be among the first to experience it.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Button 
                onClick={() => scrollToSection("waitlist")}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Join the Waitlist
              </Button>
              <Button 
                onClick={() => scrollToSection("how-it-works")}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4 text-primary" /> Watch Demo
              </Button>
            </div>
            
            <div className="pt-6">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span>No credit card required</span>
                <span className="mx-2">•</span>
                <Lock className="h-4 w-4 text-green-600" />
                <span>Your data stays private</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2 mt-12 lg:mt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-10"></div>
              <svg 
                className="w-full h-auto"
                viewBox="0 0 800 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Dashboard UI Mockup */}
                <rect width="800" height="600" fill="#f8fafc" />
                <rect x="50" y="50" width="700" height="500" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                
                {/* Left Sidebar */}
                <rect x="50" y="50" width="200" height="500" fill="#f1f5f9" />
                <circle cx="80" cy="85" r="15" fill="#3B82F6" />
                <rect x="105" y="75" width="100" height="20" rx="4" fill="#94a3b8" />
                
                {/* Sidebar Menu Items */}
                <rect x="70" y="130" width="160" height="10" rx="2" fill="#94a3b8" />
                <rect x="70" y="160" width="160" height="10" rx="2" fill="#cbd5e1" />
                <rect x="70" y="190" width="160" height="10" rx="2" fill="#cbd5e1" />
                <rect x="70" y="220" width="160" height="10" rx="2" fill="#cbd5e1" />
                <rect x="70" y="250" width="160" height="10" rx="2" fill="#cbd5e1" />
                
                {/* Main Content Area */}
                <rect x="270" y="85" width="460" height="40" rx="4" fill="#f1f5f9" />
                
                {/* Dashboard Cards */}
                <rect x="270" y="150" width="220" height="120" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                <rect x="510" y="150" width="220" height="120" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                <rect x="270" y="290" width="220" height="120" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                <rect x="510" y="290" width="220" height="120" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                
                {/* Chart Area */}
                <rect x="270" y="430" width="460" height="100" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                <path d="M290 480 L350 450 L410 470 L470 430 L530 450 L590 440 L650 470 L710 450" stroke="#3B82F6" strokeWidth="3" fill="none" />
                <path d="M290 480 L350 450 L410 470 L470 430 L530 450 L590 440 L650 470 L710 450" stroke="#3B82F6" strokeWidth="3" fill="none" />
              </svg>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full opacity-30 animate-pulse"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
