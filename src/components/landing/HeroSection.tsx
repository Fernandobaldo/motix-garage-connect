
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

const HeroSection = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleTryFree = () => {
    setShowAuthModal(true);
  };

  const handleWatchDemo = () => {
    // Scroll to demo video section
    const demoSection = document.querySelector('#demo-video');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
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

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Bring Your Workshop into the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Digital Era
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Online Bookings, Translated Chat, Smart Quotes, and More. 
              Motix Garage connects workshops with customers through smart scheduling, 
              real-time messaging, and digital quotes — fully translated for any language.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                onClick={handleTryFree}
              >
                Try for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg border-2"
                onClick={handleWatchDemo}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo Video
              </Button>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              ✅ No credit card required • ✅ GDPR compliant • ✅ 14-day free trial
            </div>
          </div>

          {/* Right Content - Demo Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Workshop Dashboard</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="text-sm">📅 New Appointment</div>
                    <div className="font-semibold">BMW 320i - Oil Change</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="text-sm">💬 Message (Auto-translated)</div>
                    <div className="font-semibold">"When will my car be ready?"</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="text-sm">💰 Quote Approved</div>
                    <div className="font-semibold">€450 - Brake Service</div>
                  </div>
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
