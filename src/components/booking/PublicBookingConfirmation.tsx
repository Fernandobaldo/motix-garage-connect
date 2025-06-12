
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkshopData {
  workshop_name: string;
  primary_color: string;
}

interface ReservationData {
  appointment_id: string;
  reservation_token: string;
}

interface PublicBookingConfirmationProps {
  workshop: WorkshopData;
  reservation: ReservationData;
}

const PublicBookingConfirmation = ({ workshop, reservation }: PublicBookingConfirmationProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'register' | 'login' | 'confirmed'>('register');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.full_name) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
            role: 'client'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Confirm reservation
        const { error: confirmError } = await supabase
          .rpc('confirm_reservation', {
            p_reservation_token: reservation.reservation_token,
            p_user_id: authData.user.id
          });

        if (confirmError) throw confirmError;

        setStep('confirmed');
        toast({
          title: 'Account Created & Appointment Confirmed',
          description: 'Your appointment has been successfully confirmed!',
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to create account. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your email and password',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Sign in user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) throw authError;

      if (authData.user) {
        // Confirm reservation
        const { error: confirmError } = await supabase
          .rpc('confirm_reservation', {
            p_reservation_token: reservation.reservation_token,
            p_user_id: authData.user.id
          });

        if (confirmError) throw confirmError;

        setStep('confirmed');
        toast({
          title: 'Appointment Confirmed',
          description: 'Your appointment has been successfully confirmed!',
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Failed to sign in. Please check your credentials.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (step === 'confirmed') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Appointment Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your appointment with {workshop.workshop_name} has been successfully confirmed.
          </p>
          <p className="text-sm text-gray-500">
            You'll receive a confirmation email shortly with all the details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Reservation Status */}
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your appointment has been temporarily reserved for 30 minutes. 
              Please create an account or sign in to confirm your booking.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Account Options */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Booking</CardTitle>
          <CardDescription>
            {step === 'register' 
              ? 'Create an account to confirm your appointment' 
              : 'Sign in to your existing account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Button 
              variant={step === 'register' ? 'default' : 'outline'}
              onClick={() => setStep('register')}
              className="flex-1"
              style={step === 'register' ? { backgroundColor: workshop.primary_color } : {}}
            >
              Create Account
            </Button>
            <Button 
              variant={step === 'login' ? 'default' : 'outline'}
              onClick={() => setStep('login')}
              className="flex-1"
              style={step === 'login' ? { backgroundColor: workshop.primary_color } : {}}
            >
              Sign In
            </Button>
          </div>

          {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                style={{ backgroundColor: workshop.primary_color }}
              >
                {loading ? 'Creating Account...' : 'Create Account & Confirm'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                style={{ backgroundColor: workshop.primary_color }}
              >
                {loading ? 'Signing In...' : 'Sign In & Confirm'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicBookingConfirmation;
