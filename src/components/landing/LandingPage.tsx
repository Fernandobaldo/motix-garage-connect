
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { LanguageProvider } from "@/contexts/LanguageContext";
import HeroSection from "./HeroSection";
import BenefitsSection from "./BenefitsSection";
import PricingSection from "./PricingSection";
import TestimonialsSection from "./TestimonialsSection";
import FAQSection from "./FAQSection";
import DemoVideoSection from "./DemoVideoSection";
import ComparisonSection from "./ComparisonSection";
import CustomerLogosSection from "./CustomerLogosSection";
import LiveSocialProof from "./LiveSocialProof";
import LandingFooter from "./LandingFooter";
import { useEffect } from "react";
import { setupScrollTracking, setupTimeTracking } from "@/utils/analytics";

const LandingPage = () => {
  useEffect(() => {
    const cleanupScroll = setupScrollTracking();
    const cleanupTime = setupTimeTracking();

    return () => {
      cleanupScroll?.();
      cleanupTime?.();
    };
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        <ScrollProgress />
        <HeroSection />
        <CustomerLogosSection />
        <BenefitsSection />
        <DemoVideoSection />
        <ComparisonSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <LandingFooter />
        <LiveSocialProof />
      </div>
    </LanguageProvider>
  );
};

export default LandingPage;
