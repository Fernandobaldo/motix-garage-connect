
import HeroSection from "./HeroSection";
import DemoVideoSection from "./DemoVideoSection";
import BenefitsSection from "./BenefitsSection";
import TestimonialsSection from "./TestimonialsSection";
import PricingSection from "./PricingSection";
import ComparisonSection from "./ComparisonSection";
import FAQSection from "./FAQSection";
import LandingFooter from "./LandingFooter";

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <DemoVideoSection />
      <BenefitsSection />
      <TestimonialsSection />
      <ComparisonSection />
      <PricingSection />
      <FAQSection />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
