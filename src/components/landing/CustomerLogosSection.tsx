
import { useEffect, useState } from "react";
import { trackConversion } from "@/utils/analytics";

const CustomerLogosSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          trackConversion.sectionView('customer_logos');
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('customer-logos');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, [isVisible]);

  // Mock customer logos - in a real app, these would be actual logos
  const customers = [
    { name: "AutoService Milano", category: "Premium Workshop", location: "Milan, IT" },
    { name: "Garage Central", category: "Multi-Brand Service", location: "Berlin, DE" },
    { name: "Moto Expert", category: "Motorcycle Specialist", location: "Lyon, FR" },
    { name: "Car Care Pro", category: "Express Service", location: "Madrid, ES" },
    { name: "Dutch Motors", category: "Family Workshop", location: "Amsterdam, NL" },
    { name: "Quick Fix", category: "Chain Workshop", location: "Brussels, BE" },
  ];

  return (
    <section id="customer-logos" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-4">
            Trusted by 2,500+ workshops across Europe
          </p>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Join Europe's Leading Auto Service Networks
          </h2>
        </div>

        {/* Customer Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {customers.map((customer, index) => (
            <div
              key={index}
              className={`group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${
                isVisible ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Logo placeholder - in real app, this would be an actual logo */}
              <div className="w-full h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-md mb-3 flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {customer.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-sm mb-1">{customer.name}</p>
                <p className="text-xs text-gray-600 mb-1">{customer.category}</p>
                <p className="text-xs text-blue-600">{customer.location}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-2">2,500+</div>
            <p className="text-gray-600 text-sm">Active Workshops</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">150K+</div>
            <p className="text-gray-600 text-sm">Happy Customers</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
            <p className="text-gray-600 text-sm">Support Available</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-indigo-600 mb-2">98%</div>
            <p className="text-gray-600 text-sm">Customer Satisfaction</p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm font-medium">GDPR Compliant</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🔒</span>
            </div>
            <span className="text-sm font-medium">SSL Secured</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">⭐</span>
            </div>
            <span className="text-sm font-medium">ISO 27001 Certified</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🏆</span>
            </div>
            <span className="text-sm font-medium">Award Winning</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerLogosSection;
