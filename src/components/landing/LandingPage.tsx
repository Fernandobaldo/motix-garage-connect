
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import BenefitsSection from "./BenefitsSection";
import PricingSection from "./PricingSection";
import TestimonialsSection from "./TestimonialsSection";
import FAQSection from "./FAQSection";
import DemoVideoSection from "./DemoVideoSection";
import ComparisonSection from "./ComparisonSection";
import CustomerLogosSection from "./CustomerLogosSection";
import LandingFooter from "./LandingFooter";
import { useEffect } from "react";
import { setupScrollTracking, setupTimeTracking } from "@/utils/analytics";

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const cleanupScroll = setupScrollTracking();
    const cleanupTime = setupTimeTracking();

    return () => {
      cleanupScroll?.();
      cleanupTime?.();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />
      
      {/* Header with Login Button */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Garage Manager</h1>
            <Button 
              onClick={() => navigate('/auth')}
              className="flex items-center space-x-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-16">
        <HeroSection />
        <CustomerLogosSection />
        <BenefitsSection />
        <DemoVideoSection />
        <ComparisonSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <LandingFooter />
      </div>
    </div>
  );
};

export default LandingPage;
