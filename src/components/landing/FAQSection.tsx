
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Can I use Motix Garage on mobile devices?",
    answer: "Yes! Motix Garage is fully responsive and works perfectly on smartphones, tablets, and desktops. We also offer native mobile apps for iOS and Android for the best mobile experience."
  },
  {
    question: "What if my client speaks another language?",
    answer: "Our built-in translation feature supports 50+ languages with real-time translation. When a customer writes in their native language, you'll see it translated to your preferred language, and vice versa."
  },
  {
    question: "Is it really free to try?",
    answer: "Absolutely! Our free plan includes up to 50 appointments per month with core features. No credit card required. You can upgrade to Pro or Premium anytime as your business grows."
  },
  {
    question: "Can I invite my whole team?",
    answer: "Yes! Pro and Premium plans include team collaboration features. You can add unlimited team members, assign roles, and manage permissions. Everyone stays on the same page with real-time updates."
  },
  {
    question: "How secure is my customer data?",
    answer: "Security is our top priority. We're GDPR compliant, use bank-level encryption, and store all data in secure European data centers. Your customer information is protected with industry-leading security measures."
  },
  {
    question: "What integrations do you support?",
    answer: "We integrate with popular accounting software (QuickBooks, Xero), payment processors (Stripe, PayPal), and calendar apps (Google Calendar, Outlook). Premium plans include API access for custom integrations."
  }
];

const FAQSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Got questions? We've got answers. If you can't find what you're looking for, 
            our support team is here to help.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-gray-50 rounded-lg px-6 border-0"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <div className="space-x-4">
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              📧 Email Support
            </a>
            <span className="text-gray-400">•</span>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              💬 Live Chat
            </a>
            <span className="text-gray-400">•</span>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              📞 Schedule Call
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
