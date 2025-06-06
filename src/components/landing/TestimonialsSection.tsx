
const testimonials = [
  {
    quote: "Since using Motix, we've increased client retention by 40% and cut WhatsApp chaos in half.",
    author: "Marco Rossi",
    role: "Owner, Rossi Auto Repair",
    location: "Milan, Italy"
  },
  {
    quote: "The translation feature is a game-changer. We serve customers from 15 different countries now.",
    author: "Klaus Mueller",
    role: "Workshop Manager",
    location: "Berlin, Germany"
  },
  {
    quote: "Digital quotes saved us 3 hours per day. Customers love the transparency and quick approvals.",
    author: "Jean Dubois",
    role: "Auto Service Director",
    location: "Lyon, France"
  },
  {
    quote: "Our appointment no-shows dropped by 60% with automated reminders and confirmations.",
    author: "Ana García",
    role: "Service Coordinator",
    location: "Madrid, Spain"
  },
  {
    quote: "The customer dashboard helps us provide better service and build stronger relationships.",
    author: "Piet van der Berg",
    role: "Workshop Owner",
    location: "Amsterdam, Netherlands"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Workshop Owners Across Europe
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            See what our customers are saying about Motix Garage
          </p>
          
          {/* Social proof stats bar */}
          <div className="inline-flex items-center bg-white px-6 py-3 rounded-full shadow-md mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs">⭐</span>
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">4.9/5 Rating</div>
                <div className="text-sm text-gray-600">Based on 1,250+ reviews</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
              {/* Verified badge */}
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                <span>✓</span>
                <span>Verified</span>
              </div>
              
              {/* Star rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">⭐</span>
                ))}
              </div>
              
              <div className="text-blue-600 text-4xl mb-4">"</div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {testimonial.quote}
              </p>
              <div className="border-t pt-4">
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
                <div className="text-sm text-blue-600">{testimonial.location}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-6 bg-white px-8 py-4 rounded-full shadow-md">
            <div className="flex -space-x-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full border-2 border-white"></div>
              ))}
              <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">+2K</span>
              </div>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Join 2,500+ workshops</div>
              <div className="text-sm text-gray-600">Start your free trial today</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
