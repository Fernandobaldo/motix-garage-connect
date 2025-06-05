
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, User, Building, Mail, Lock, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (role: 'client' | 'workshop') => void;
}

const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (role: 'client' | 'workshop') => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Login Successful!",
      description: `Welcome back to Motix Garage.`,
    });
    
    setIsLoading(false);
    onLogin(role);
  };

  const handleRegister = async (role: 'client' | 'workshop') => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Registration Successful!",
      description: `Your ${role} account has been created successfully.`,
    });
    
    setIsLoading(false);
    onLogin(role);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Car className="h-5 w-5 text-white" />
            </div>
            Welcome to Motix Garage
          </DialogTitle>
          <DialogDescription>
            Choose your account type to get started with our automotive management platform.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="cursor-pointer hover:bg-blue-50 transition-colors border-2 hover:border-blue-200" 
                    onClick={() => handleLogin('client')}>
                <CardContent className="p-4 text-center">
                  <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-sm">Client Login</h3>
                  <p className="text-xs text-gray-600 mt-1">Book services & track repairs</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-green-50 transition-colors border-2 hover:border-green-200" 
                    onClick={() => handleLogin('workshop')}>
                <CardContent className="p-4 text-center">
                  <Building className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-sm">Workshop Login</h3>
                  <p className="text-xs text-gray-600 mt-1">Manage your auto repair business</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                disabled={isLoading}
                onClick={() => handleLogin('client')}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="cursor-pointer hover:bg-blue-50 transition-colors border-2 hover:border-blue-200" 
                    onClick={() => handleRegister('client')}>
                <CardContent className="p-4 text-center">
                  <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-sm">Register as Client</h3>
                  <p className="text-xs text-gray-600 mt-1">I need automotive services</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-green-50 transition-colors border-2 hover:border-green-200" 
                    onClick={() => handleRegister('workshop')}>
                <CardContent className="p-4 text-center">
                  <Building className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-sm">Register Workshop</h3>
                  <p className="text-xs text-gray-600 mt-1">I run an auto repair business</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="register-name">Full Name</Label>
                <Input
                  id="register-name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="register-phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-phone"
                    placeholder="Enter your phone number"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                disabled={isLoading}
                onClick={() => handleRegister('client')}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
