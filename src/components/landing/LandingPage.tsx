
import { useState } from "react";
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

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`#${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="min-h-screen">
        {/* Navigation Header */}
        <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Motix Garage
                </span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => scrollToSection('demo-video')}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Demo
                </button>
                <button 
                  onClick={() => scrollToSection('benefits')}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => scrollToSection('faq')}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  FAQ
                </button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
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
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-200">
                <div className="flex flex-col space-y-4">
                  <button 
                    onClick={() => scrollToSection('demo-video')}
                    className="text-left text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Demo
                  </button>
                  <button 
                    onClick={() => scrollToSection('benefits')}
                    className="text-left text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Features
                  </button>
                  <button 
                    onClick={() => scrollToSection('pricing')}
                    className="text-left text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Pricing
                  </button>
                  <button 
                    onClick={() => scrollToSection('faq')}
                    className="text-left text-gray-700 hover:text-blue-600 transition-colors"
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
                    >
                      Sign In
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setShowAuthModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
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
          <HeroSection />
          <div id="demo-video">
            <DemoVideoSection />
          </div>
          <div id="benefits">
            <BenefitsSection />
          </div>
          <TestimonialsSection />
          <ComparisonSection />
          <div id="pricing">
            <PricingSection />
          </div>
          <div id="faq">
            <FAQSection />
          </div>
          <LandingFooter />
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default LandingPage;
