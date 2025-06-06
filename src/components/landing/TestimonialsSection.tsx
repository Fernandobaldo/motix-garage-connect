
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
          <p className="text-xl text-gray-600">
            See what our customers are saying about Motix Garage
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
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
          <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-md">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full border-2 border-white"></div>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">Join 2,500+ workshops</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
