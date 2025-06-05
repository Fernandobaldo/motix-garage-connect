
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { Building, Settings, Save } from 'lucide-react';

const TenantSetup = () => {
  const { profile } = useAuth();
  const { tenant, updateTenant, loading } = useTenant();
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    address: '',
    phone: '',
    email: '',
    services_offered: [] as string[],
    working_hours: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        subdomain: tenant.subdomain || '',
        address: tenant.settings?.address || '',
        phone: tenant.settings?.phone || '',
        email: tenant.settings?.email || '',
        services_offered: tenant.settings?.services_offered || [],
        working_hours: tenant.settings?.working_hours || {},
      });
    }
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updates = {
      name: formData.name,
      subdomain: formData.subdomain,
      settings: {
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        services_offered: formData.services_offered,
        working_hours: formData.working_hours,
      }
    };

    await updateTenant(updates);
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (profile?.role !== 'workshop') {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Only workshop owners can access tenant settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Building className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Workshop Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
          <CardDescription>
            Configure your workshop's basic information and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Workshop Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter workshop name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="subdomain">Subdomain (Optional)</Label>
                <Input
                  id="subdomain"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                  placeholder="workshop-name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter workshop address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Workshop Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantSetup;
