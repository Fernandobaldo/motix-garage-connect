
import { Calendar, MessageSquare, FileText, Clock, Shield, Globe } from "lucide-react";

const benefits = [
  {
    icon: Calendar,
    title: "Easy Online Scheduling",
    description: "Customers book appointments 24/7 through your branded booking page"
  },
  {
    icon: MessageSquare,
    title: "Translated Chat",
    description: "Communicate with clients in any language with real-time translation"
  },
  {
    icon: FileText,
    title: "Digital Quotations",
    description: "Send professional quotes with approval system and payment tracking"
  },
  {
    icon: Clock,
    title: "Service History",
    description: "Complete vehicle and appointment history at your fingertips"
  },
  {
    icon: Shield,
    title: "GDPR Compliant",
    description: "European data protection standards built-in from day one"
  },
  {
    icon: Globe,
    title: "Multi-language Support",
    description: "Serve international clients with automatic translation features"
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything Your Workshop Needs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline operations, improve customer satisfaction, and grow your business 
            with our comprehensive workshop management platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="group p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <benefit.icon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
