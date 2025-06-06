import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ContactForm from "./ContactForm";

const faqs = [
  {
    question: "Can I use Motix Garage on mobile devices?",
    answer: "Yes! Motix Garage is fully responsive and works perfectly on smartphones, tablets, and desktops. We also have native mobile apps coming soon for iOS and Android."
  },
  {
    question: "What if my client speaks another language?",
    answer: "Our real-time translation feature automatically translates messages between you and your clients in over 50 languages. Communication barriers are eliminated completely."
  },
  {
    question: "Is it really free to try?",
    answer: "Absolutely! You get a 14-day free trial with full access to all Pro features. No credit card required to start. You can also use our Free plan indefinitely for up to 50 appointments per month."
  },
  {
    question: "Can I invite my whole team?",
    answer: "Yes, you can add unlimited team members to your workshop account. Each team member gets their own login and you can control their permissions and access levels."
  },
  {
    question: "Is my data secure and GDPR compliant?",
    answer: "Security is our top priority. All data is encrypted, stored securely in European data centers, and we're fully GDPR compliant. Your customer data is always protected."
  },
  {
    question: "Can I customize quotes and invoices with my branding?",
    answer: "Yes! Pro and Premium plans include custom branding options. Add your logo, colors, and business information to all quotes, invoices, and customer communications."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Motix Garage
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="font-semibold text-gray-900 pr-8">{faq.question}</h3>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <button 
              onClick={() => setShowContactForm(true)}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Contact our support team →
            </button>
          </div>
        </div>
      </section>

      <ContactForm 
        isOpen={showContactForm} 
        onClose={() => setShowContactForm(false)}
        type="contact"
      />
    </>
  );
};

export default FAQSection;
