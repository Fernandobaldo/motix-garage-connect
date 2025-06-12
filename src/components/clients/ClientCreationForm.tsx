
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, Car, Loader2 } from 'lucide-react';
import UnifiedVehicleForm from '../vehicles/UnifiedVehicleForm';

const clientSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Valid email is required').optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientCreationFormProps {
  onSuccess?: () => void;
}

const ClientCreationForm = ({ onSuccess }: ClientCreationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('client');
  const { toast } = useToast();
  const { profile } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const onSubmit = async (data: ClientFormData) => {
    if (!profile?.tenant_id) {
      toast({
        title: 'Error',
        description: 'No tenant found. Please contact support.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First create the client user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email || `${data.phone}@temp.local`, // Use temp email if none provided
        password: Math.random().toString(36).slice(-8), // Generate random password
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone,
            role: 'client'
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Update the profile to set the tenant_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          tenant_id: profile.tenant_id,
          full_name: data.full_name,
          phone: data.phone,
          role: 'client'
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      setCreatedClientId(authData.user.id);
      setActiveTab('vehicle');

      toast({
        title: 'Success',
        description: 'Client created successfully. Now add their vehicle information.',
      });

    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create client',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVehicleSuccess = () => {
    toast({
      title: 'Success',
      description: 'Client and vehicle created successfully!',
    });
    reset();
    setCreatedClientId(null);
    setActiveTab('client');
    onSuccess?.();
  };

  const handleSkipVehicle = () => {
    toast({
      title: 'Client Created',
      description: 'Client created successfully. Vehicle can be added later.',
    });
    reset();
    setCreatedClientId(null);
    setActiveTab('client');
    onSuccess?.();
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="client" disabled={!!createdClientId}>
            <User className="h-4 w-4 mr-2" />
            Client Information
          </TabsTrigger>
          <TabsTrigger value="vehicle" disabled={!createdClientId}>
            <Car className="h-4 w-4 mr-2" />
            Vehicle Information
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Client Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      {...register('full_name')}
                      placeholder="John Doe"
                      className={errors.full_name ? 'border-red-500' : ''}
                    />
                    {errors.full_name && (
                      <p className="text-sm text-red-500">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="(555) 123-4567"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="john@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Client
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle" className="space-y-4">
          {createdClientId && (
            <>
              <UnifiedVehicleForm
                isOpen={true}
                onClose={() => {}}
                onSuccess={handleVehicleSuccess}
                ownerId={createdClientId}
              />
              
              <div className="flex justify-center">
                <Button variant="outline" onClick={handleSkipVehicle}>
                  Skip Vehicle - Complete Later
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientCreationForm;
