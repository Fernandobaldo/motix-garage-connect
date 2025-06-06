import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import ContactForm from "./ContactForm";

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Perfect for small workshops getting started",
    features: [
      "Up to 50 appointments/month",
      "Basic scheduling",
      "Email notifications",
      "Mobile app access",
      "Community support"
    ],
    buttonText: "Start Free",
    popular: false
  },
  {
    name: "Pro",
    price: "€29",
    period: "per month",
    description: "For growing workshops with regular customers",
    features: [
      "Unlimited appointments",
      "Real-time translated chat",
      "Digital quotations",
      "Customer database",
      "Analytics dashboard",
      "Priority support",
      "Custom branding"
    ],
    buttonText: "Start Free Trial",
    popular: true
  },
  {
    name: "Premium",
    price: "€79",
    period: "per month",
    description: "For established workshops with multiple locations",
    features: [
      "Everything in Pro",
      "Multi-location management",
      "Advanced reporting",
      "API access",
      "White-label solution",
      "Dedicated account manager",
      "Custom integrations",
      "24/7 phone support"
    ],
    buttonText: "Contact Sales",
    popular: false
  }
];

const PricingSection = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormType, setContactFormType] = useState<'contact' | 'demo' | 'premium'>('contact');

  const handlePlanClick = (planName: string) => {
    if (planName === "Premium") {
      setContactFormType('premium');
      setShowContactForm(true);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your workshop size. Start free and upgrade as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : 'border border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-4">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full py-3 ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                    onClick={() => handlePlanClick(plan.name)}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              All plans include 14-day free trial • No setup fees • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ContactForm 
        isOpen={showContactForm} 
        onClose={() => setShowContactForm(false)}
        type={contactFormType}
      />
    </>
  );
};

export default PricingSection;
