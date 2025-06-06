
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import ContactForm from "./ContactForm";
import LanguageSelector from "./LanguageSelector";

const LandingFooter = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <>
      <footer className="bg-gray-900 text-white">
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              Ready to Transform Your Workshop?
            </h2>
            <p className="text-xl text-blue-100 mb-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
              Join thousands of workshop owners who've already made the switch to digital operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl group"
                onClick={() => setShowAuthModal(true)}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg hover:scale-105 transition-all duration-200 group"
                onClick={() => setShowContactForm(true)}
              >
                Book Demo Call
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-1 animate-in fade-in-0 slide-in-from-left-4 duration-700">
                <h3 className="text-2xl font-bold mb-4 group cursor-pointer">
                  <span className="group-hover:text-blue-400 transition-colors duration-200">Motix Garage</span>
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  The complete workshop management solution for the digital age. 
                  Trusted by 2,500+ workshops across Europe.
                </p>
                <div className="flex items-center space-x-2 text-gray-300 group">
                  <Globe className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
                  <span className="group-hover:text-white transition-colors duration-200">Available in 15+ languages</span>
                </div>
              </div>

              {/* Product Links */}
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
                <h4 className="font-semibold text-lg mb-4">Product</h4>
                <ul className="space-y-3 text-gray-300">
                  <li><a href="#benefits" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">Integrations</a></li>
                  <li><a href="#" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">API Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">Mobile Apps</a></li>
                </ul>
              </div>

              {/* Company Links */}
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
                <h4 className="font-semibold text-lg mb-4">Company</h4>
                <ul className="space-y-3 text-gray-300">
                  <li><a href="#" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">Press Kit</a></li>
                  <li><a href="#" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">Partners</a></li>
                </ul>
              </div>

              {/* Support Links */}
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-450">
                <h4 className="font-semibold text-lg mb-4">Support</h4>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <button 
                      onClick={() => setShowContactForm(true)}
                      className="hover:text-white transition-all duration-200 text-left hover:translate-x-2 transform block"
                    >
                      Help Center
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setShowContactForm(true)}
                      className="hover:text-white transition-all duration-200 text-left hover:translate-x-2 transform block"
                    >
                      Contact Support
                    </button>
                  </li>
                  <li><a href="#" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">System Status</a></li>
                  <li><a href="#" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">Training</a></li>
                  <li><a href="#" className="hover:text-white transition-all duration-200 hover:translate-x-2 transform block">Community</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-gray-300 text-sm">
                © 2024 Motix Garage. All rights reserved.
              </div>
              
              <div className="flex items-center space-x-6 text-gray-300 text-sm">
                <a href="#" className="hover:text-white transition-all duration-200 hover:scale-105">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-all duration-200 hover:scale-105">Terms of Service</a>
                <a href="#" className="hover:text-white transition-all duration-200 hover:scale-105">GDPR</a>
                <a href="#" className="hover:text-white transition-all duration-200 hover:scale-105">Cookies</a>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 text-sm">Follow us:</span>
                  <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 hover:scale-110">LinkedIn</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 hover:scale-110">Twitter</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 hover:scale-110">YouTube</a>
                </div>
                <div className="border-l border-gray-700 pl-6">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ContactForm 
        isOpen={showContactForm} 
        onClose={() => setShowContactForm(false)}
        type="demo"
      />
    </>
  );
};

export default LandingFooter;
