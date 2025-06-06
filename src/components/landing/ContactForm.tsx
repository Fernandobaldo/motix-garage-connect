
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Building, User } from "lucide-react";

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'contact' | 'demo' | 'premium';
}

const ContactForm = ({ isOpen, onClose, type }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    planInterest: type === 'premium' ? 'Premium' : ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getFormTitle = () => {
    switch (type) {
      case 'demo':
        return 'Book a Demo Call';
      case 'premium':
        return 'Contact Sales - Premium Plan';
      default:
        return 'Contact Us';
    }
  };

  const getFormDescription = () => {
    switch (type) {
      case 'demo':
        return 'Schedule a personalized demo of Motix Garage and see how it can transform your workshop operations.';
      case 'premium':
        return 'Get in touch with our sales team to discuss Premium features and custom pricing for your business.';
      default:
        return 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call - in real implementation, this would send to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Contact form submission:', { ...formData, type });
      
      toast({
        title: "Message Sent!",
        description: type === 'demo' 
          ? "Thank you for your interest! Our team will contact you within 24 hours to schedule your demo."
          : "Thank you for your message! We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
        planInterest: type === 'premium' ? 'Premium' : ''
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{getFormTitle()}</DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <p className="text-gray-600">{getFormDescription()}</p>
          </CardHeader>
          
          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    Workshop/Company Name
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Your workshop name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">
                  {type === 'demo' ? 'Tell us about your workshop' : 'Message'}
                  {type !== 'demo' && ' *'}
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  required={type !== 'demo'}
                  placeholder={type === 'demo' 
                    ? "Brief description of your workshop size, services, and what you'd like to see in the demo..."
                    : "Tell us how we can help..."
                  }
                  rows={4}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  {isSubmitting ? "Sending..." : (type === 'demo' ? "Schedule Demo" : "Send Message")}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ContactForm;
