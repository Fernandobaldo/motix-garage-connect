
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Building, User, CheckCircle } from "lucide-react";
import { trackConversion } from "@/utils/analytics";

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
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (type !== 'demo' && !formData.message.trim()) {
      newErrors.message = "Message is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Track the conversion attempt
      trackConversion.contactFormSubmit(type);
      
      // Simulate API call with realistic timing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Contact form submission:', { ...formData, type });
      
      setIsSuccess(true);
      
      toast({
        title: "Message Sent!",
        description: type === 'demo' 
          ? "Thank you for your interest! Our team will contact you within 24 hours to schedule your demo."
          : "Thank you for your message! We'll get back to you within 24 hours.",
      });

      // Reset form after 3 seconds and close
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          message: "",
          planInterest: type === 'premium' ? 'Premium' : ''
        });
        setIsSuccess(false);
        onClose();
      }, 3000);
      
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
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSuccess(false);
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{getFormTitle()}</DialogTitle>
        </DialogHeader>
        
        <LoadingState 
          isLoading={isSubmitting} 
          loadingText="Sending your message..."
          overlay={true}
        >
          {isSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-700 mb-2">Message Sent Successfully!</h3>
              <p className="text-gray-600">
                {type === 'demo' 
                  ? "We'll contact you within 24 hours to schedule your demo."
                  : "We'll get back to you within 24 hours."
                }
              </p>
            </div>
          ) : (
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
                        placeholder="Your full name"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
                        placeholder="your@email.com"
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
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
                      placeholder={type === 'demo' 
                        ? "Brief description of your workshop size, services, and what you'd like to see in the demo..."
                        : "Tell us how we can help..."
                      }
                      rows={4}
                      className={errors.message ? "border-red-500" : ""}
                    />
                    {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <LoadingButton 
                      type="submit" 
                      loading={isSubmitting}
                      loadingText="Sending..."
                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                    >
                      {type === 'demo' ? "Schedule Demo" : "Send Message"}
                    </LoadingButton>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </LoadingState>
      </DialogContent>
    </Dialog>
  );
};

export default ContactForm;
