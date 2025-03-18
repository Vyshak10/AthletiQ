import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
      
      // Close mobile menu if it's open
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  };

  // Handle scroll events to add shadow to header when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200 transition-shadow",
      isScrolled && "shadow-sm"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="#" className="flex items-center">
              <div className="w-8 h-8 rounded-md bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold mr-2">LP</div>
              <span className="text-xl font-bold">LaunchPad</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <button 
              onClick={() => scrollToSection("features")}
              className="text-gray-600 hover:text-primary font-medium"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection("how-it-works")}
              className="text-gray-600 hover:text-primary font-medium"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection("faq")}
              className="text-gray-600 hover:text-primary font-medium"
            >
              FAQ
            </button>
            <Button 
              onClick={() => scrollToSection("waitlist")}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Join Waitlist
            </Button>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "md:hidden bg-white border-t border-gray-200 animate-in fade-in-50",
          !isMenuOpen && "hidden"
        )}
      >
        <div className="px-4 py-3 space-y-3">
          <button 
            onClick={() => scrollToSection("features")}
            className="block text-gray-600 hover:text-primary font-medium w-full text-left"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection("how-it-works")}
            className="block text-gray-600 hover:text-primary font-medium w-full text-left"
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection("faq")}
            className="block text-gray-600 hover:text-primary font-medium w-full text-left"
          >
            FAQ
          </button>
          <Button 
            onClick={() => scrollToSection("waitlist")}
            className="w-full bg-primary hover:bg-primary/90 text-white mt-4"
          >
            Join Waitlist
          </Button>
        </div>
      </div>
    </header>
  );
}
