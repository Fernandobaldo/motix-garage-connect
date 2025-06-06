
import { Check, X } from "lucide-react";

const beforeAfterData = [
  {
    category: "Appointment Management",
    before: "Paper calendars, phone calls, double bookings",
    after: "Online booking, automated scheduling, real-time availability"
  },
  {
    category: "Customer Communication",
    before: "WhatsApp chaos, language barriers, lost messages",
    after: "Centralized messaging, auto-translation, chat history"
  },
  {
    category: "Quotations",
    before: "Paper estimates, manual calculations, delays",
    after: "Digital quotes, instant delivery, online approval"
  },
  {
    category: "Payment Tracking",
    before: "Cash only, manual invoicing, payment delays",
    after: "Multiple payment options, automated invoicing"
  },
  {
    category: "Service Records",
    before: "Lost paperwork, no history tracking",
    after: "Complete digital records, maintenance alerts"
  },
  {
    category: "Team Coordination",
    before: "Sticky notes, verbal updates, confusion",
    after: "Real-time updates, task assignments, progress tracking"
  }
];

const ComparisonSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Transform Your Workshop Operations
          </h2>
          <p className="text-xl text-gray-600">
            See the difference Motix Garage makes in day-to-day operations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Before Column */}
          <div className="bg-white rounded-2xl p-8 border-2 border-red-200">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Before Motix</h3>
            </div>
            
            <div className="space-y-6">
              {beforeAfterData.map((item, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <h4 className="font-semibold text-gray-900 mb-2">{item.category}</h4>
                  <p className="text-red-600">{item.before}</p>
                </div>
              ))}
            </div>
          </div>

          {/* After Column */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-200">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">After Motix</h3>
            </div>
            
            <div className="space-y-6">
              {beforeAfterData.map((item, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <h4 className="font-semibold text-gray-900 mb-2">{item.category}</h4>
                  <p className="text-green-700">{item.after}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              The Results Speak for Themselves
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">40%</div>
                <div className="text-gray-600">Increase in Customer Retention</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">60%</div>
                <div className="text-gray-600">Reduction in No-Shows</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">3hrs</div>
                <div className="text-gray-600">Daily Time Savings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">15+</div>
                <div className="text-gray-600">Languages Supported</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
