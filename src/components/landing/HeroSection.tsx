
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { trackConversion, setupScrollTracking, setupTimeTracking } from "@/utils/analytics";

const HeroSection = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isNavigatingToDemo, setIsNavigatingToDemo] = useState(false);

  useEffect(() => {
    // Setup analytics tracking
    const cleanupScroll = setupScrollTracking();
    const cleanupTime = setupTimeTracking();

    return () => {
      cleanupScroll?.();
      cleanupTime?.();
    };
  }, []);

  const handleTryFree = () => {
    trackConversion.freeTrialSignup();
    setShowAuthModal(true);
  };

  const handleWatchDemo = async () => {
    setIsNavigatingToDemo(true);
    trackConversion.demoVideoPlay();
    
    // Simulate loading time for demo section scroll
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Scroll to demo video section
    const demoSection = document.querySelector('#demo-video');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    setIsNavigatingToDemo(false);
  };

  return (
    <>
      <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 opacity-20">
            <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
          </div>
          <div className="absolute top-1/3 right-1/3 opacity-20 animation-delay-1000">
            <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
          </div>
          <div className="absolute bottom-1/4 right-1/4 opacity-20 animation-delay-2000">
            <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 animate-in fade-in-0 slide-in-from-left-8 duration-700">
              Bring Your Workshop into the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 transition-all duration-500">
                Digital Era
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed animate-in fade-in-0 slide-in-from-left-8 duration-700 delay-150">
              Online Bookings, Translated Chat, Smart Quotes, and More. 
              Motix Garage connects workshops with customers through smart scheduling, 
              real-time messaging, and digital quotes — fully translated for any language.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-300">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl group"
                onClick={handleTryFree}
              >
                Try for Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              
              <LoadingButton 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg border-2 hover:scale-105 transition-all duration-200 group hover:shadow-lg"
                onClick={handleWatchDemo}
                loading={isNavigatingToDemo}
                loadingText="Loading Demo..."
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Watch Demo Video
              </LoadingButton>
            </div>

            <div className="mt-8 text-sm text-gray-500 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-500">
              <span className="inline-flex items-center space-x-2 hover:text-gray-700 transition-colors duration-200">
                <span>✅ No credit card required</span>
              </span>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center space-x-2 hover:text-gray-700 transition-colors duration-200">
                <span>✅ GDPR compliant</span>
              </span>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center space-x-2 hover:text-gray-700 transition-colors duration-200">
                <span>✅ 14-day free trial</span>
              </span>
            </div>
          </div>

          {/* Right Content - Demo Preview */}
          <div className="relative animate-in fade-in-0 slide-in-from-right-8 duration-700 delay-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-105 group">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold group-hover:scale-105 transition-transform duration-200">Workshop Dashboard</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full hover:scale-110 transition-transform duration-200"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full hover:scale-110 transition-transform duration-200 animation-delay-100"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full hover:scale-110 transition-transform duration-200 animation-delay-200"></div>
                  </div>
                </div>
                
                {/* Content Cards */}
                <div className="space-y-3">
                  <div className="bg-white bg-opacity-20 rounded p-3 hover:bg-opacity-30 transition-all duration-200 hover:translate-x-1 transform">
                    <div className="text-sm opacity-90">📅 New Appointment</div>
                    <div className="font-semibold">BMW 320i - Oil Change</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded p-3 hover:bg-opacity-30 transition-all duration-200 hover:translate-x-1 transform animation-delay-150">
                    <div className="text-sm opacity-90">💬 Message (Auto-translated)</div>
                    <div className="font-semibold">"When will my car be ready?"</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded p-3 hover:bg-opacity-30 transition-all duration-200 hover:translate-x-1 transform animation-delay-300">
                    <div className="text-sm opacity-90">💰 Quote Approved</div>
                    <div className="font-semibold">€450 - Brake Service</div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-2 right-2 opacity-20">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="absolute bottom-2 left-2 opacity-20 animation-delay-1000">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default HeroSection;
