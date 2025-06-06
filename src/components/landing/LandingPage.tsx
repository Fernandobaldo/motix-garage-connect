
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Car, Menu, X } from "lucide-react";
import HeroSection from "./HeroSection";
import DemoVideoSection from "./DemoVideoSection";
import BenefitsSection from "./BenefitsSection";
import TestimonialsSection from "./TestimonialsSection";
import PricingSection from "./PricingSection";
import ComparisonSection from "./ComparisonSection";
import FAQSection from "./FAQSection";
import LandingFooter from "./LandingFooter";
import AuthModal from "@/components/auth/AuthModal";
import { LanguageProvider } from "@/contexts/LanguageContext";

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`#${sectionId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen">
        {/* Navigation Header */}
        <nav className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md border-gray-200 shadow-sm' 
            : 'bg-white/90 backdrop-blur-md border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Car className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-200" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Motix Garage
                </span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => scrollToSection('demo-video')}
                  className="text-gray-700 hover:text-blue-600 transition-all duration-200 relative group"
                >
                  Demo
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </button>
                <button 
                  onClick={() => scrollToSection('benefits')}
                  className="text-gray-700 hover:text-blue-600 transition-all duration-200 relative group"
                >
                  Features
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-gray-700 hover:text-blue-600 transition-all duration-200 relative group"
                >
                  Pricing
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </button>
                <button 
                  onClick={() => scrollToSection('faq')}
                  className="text-gray-700 hover:text-blue-600 transition-all duration-200 relative group"
                >
                  FAQ
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  Sign In
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Try Free
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="hover:scale-110 transition-transform duration-200"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top-2 fade-in-0 duration-200">
                <div className="flex flex-col space-y-4">
                  <button 
                    onClick={() => scrollToSection('demo-video')}
                    className="text-left text-gray-700 hover:text-blue-600 transition-colors duration-200 hover:translate-x-2 transform"
                  >
                    Demo
                  </button>
                  <button 
                    onClick={() => scrollToSection('benefits')}
                    className="text-left text-gray-700 hover:text-blue-600 transition-colors duration-200 hover:translate-x-2 transform"
                  >
                    Features
                  </button>
                  <button 
                    onClick={() => scrollToSection('pricing')}
                    className="text-left text-gray-700 hover:text-blue-600 transition-colors duration-200 hover:translate-x-2 transform"
                  >
                    Pricing
                  </button>
                  <button 
                    onClick={() => scrollToSection('faq')}
                    className="text-left text-gray-700 hover:text-blue-600 transition-colors duration-200 hover:translate-x-2 transform"
                  >
                    FAQ
                  </button>
                  <div className="flex flex-col space-y-2 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowAuthModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      Sign In
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setShowAuthModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                    >
                      Try Free
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Page Content */}
        <div className="pt-16">
          <div className="animate-in fade-in-0 duration-700">
            <HeroSection />
          </div>
          <div id="demo-video" className="scroll-mt-16">
            <DemoVideoSection />
          </div>
          <div id="benefits" className="scroll-mt-16">
            <BenefitsSection />
          </div>
          <TestimonialsSection />
          <ComparisonSection />
          <div id="pricing" className="scroll-mt-16">
            <PricingSection />
          </div>
          <div id="faq" className="scroll-mt-16">
            <FAQSection />
          </div>
          <LandingFooter />
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </LanguageProvider>
  );
};

export default LandingPage;
