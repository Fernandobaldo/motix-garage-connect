
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { LanguageProvider } from "@/contexts/LanguageContext";
import HeroSection from "./HeroSection";
import BenefitsSection from "./BenefitsSection";
import PricingSection from "./PricingSection";
import TestimonialsSection from "./TestimonialsSection";
import FAQSection from "./FAQSection";
import DemoVideoSection from "./DemoVideoSection";
import ComparisonSection from "./ComparisonSection";
import LandingFooter from "./LandingFooter";

const LandingPage = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        <ScrollProgress />
        <HeroSection />
        <BenefitsSection />
        <DemoVideoSection />
        <ComparisonSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <LandingFooter />
      </div>
    </LanguageProvider>
  );
};

export default LandingPage;
