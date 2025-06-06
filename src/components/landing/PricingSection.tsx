
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 50 appointments/month",
      "Basic chat support",
      "Digital quotes",
      "Vehicle history",
      "Email notifications"
    ],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Pro",
    price: "€29",
    period: "per month",
    description: "For growing workshops",
    features: [
      "Unlimited appointments",
      "Real-time translation",
      "Advanced analytics",
      "SMS reminders",
      "Team collaboration",
      "Priority support",
      "Custom branding"
    ],
    cta: "Start Pro Trial",
    popular: true
  },
  {
    name: "Premium",
    price: "€79",
    period: "per month",
    description: "For multi-location businesses",
    features: [
      "Everything in Pro",
      "Multi-location management",
      "API access",
      "White-label solution",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced reporting"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const PricingSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Start free — no credit card required. Upgrade as you grow.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative p-8 rounded-2xl border-2 ${
              plan.popular 
                ? 'border-blue-500 shadow-2xl scale-105' 
                : 'border-gray-200 hover:border-gray-300'
            } transition-all duration-300`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full ${
                  plan.popular 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
                size="lg"
              >
                {plan.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include 14-day free trial • Cancel anytime • No setup fees
          </p>
          <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
            <span>🔒 Secure payments</span>
            <span>🇪🇺 GDPR compliant</span>
            <span>📞 24/7 support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
