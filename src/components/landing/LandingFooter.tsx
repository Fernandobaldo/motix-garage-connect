
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import ContactForm from "./ContactForm";

const LandingFooter = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <>
      <footer className="bg-gray-900 text-white">
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Transform Your Workshop?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of workshop owners who've already made the switch to digital operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
                onClick={() => setShowAuthModal(true)}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
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
              <div className="lg:col-span-1">
                <h3 className="text-2xl font-bold mb-4">Motix Garage</h3>
                <p className="text-gray-300 mb-6">
                  The complete workshop management solution for the digital age. 
                  Trusted by 2,500+ workshops across Europe.
                </p>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Globe className="h-5 w-5" />
                  <span>Available in 15+ languages</span>
                </div>
              </div>

              {/* Product Links */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Product</h4>
                <ul className="space-y-3 text-gray-300">
                  <li><a href="#benefits" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Mobile Apps</a></li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Company</h4>
                <ul className="space-y-3 text-gray-300">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
                </ul>
              </div>

              {/* Support Links */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Support</h4>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <button 
                      onClick={() => setShowContactForm(true)}
                      className="hover:text-white transition-colors text-left"
                    >
                      Help Center
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setShowContactForm(true)}
                      className="hover:text-white transition-colors text-left"
                    >
                      Contact Support
                    </button>
                  </li>
                  <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Training</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <div className="text-gray-300 text-sm mb-4 lg:mb-0">
                © 2024 Motix Garage. All rights reserved.
              </div>
              
              <div className="flex items-center space-x-6 text-gray-300 text-sm">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">GDPR</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>

              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                <span className="text-gray-400 text-sm">Follow us:</span>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">YouTube</a>
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
