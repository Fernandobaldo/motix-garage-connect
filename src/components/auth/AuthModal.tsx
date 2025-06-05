
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Car, User, Building, Mail, Lock, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { signIn, signUp, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [selectedRole, setSelectedRole] = useState<'client' | 'workshop'>('client');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) return;

    setIsLoading(true);
    const { error } = await signIn(formData.email, formData.password);
    
    if (!error) {
      onClose();
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        confirmPassword: ''
      });
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.full_name) return;
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.full_name,
      phone: formData.phone,
      role: selectedRole
    });
    
    if (!error) {
      onClose();
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        confirmPassword: ''
      });
    }
    setIsLoading(false);
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
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
                disabled={isLoading || loading}
                onClick={handleLogin}
              >
                {isLoading || loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-colors border-2 ${
                  selectedRole === 'client' 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'hover:bg-blue-50 hover:border-blue-200'
                }`}
                onClick={() => setSelectedRole('client')}
              >
                <CardContent className="p-4 text-center">
                  <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-sm">Register as Client</h3>
                  <p className="text-xs text-gray-600 mt-1">I need automotive services</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors border-2 ${
                  selectedRole === 'workshop' 
                    ? 'border-green-200 bg-green-50' 
                    : 'hover:bg-green-50 hover:border-green-200'
                }`}
                onClick={() => setSelectedRole('workshop')}
              >
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
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
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
                disabled={isLoading || loading}
                onClick={handleRegister}
              >
                {isLoading || loading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
