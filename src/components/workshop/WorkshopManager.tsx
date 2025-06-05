
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { useWorkshop } from '@/hooks/useWorkshop';
import { Building } from 'lucide-react';
import WorkshopProfileForm from './WorkshopProfileForm';
import RoleGuard from '@/components/auth/RoleGuard';

const WorkshopManager = () => {
  const { profile } = useAuth();
  const { tenant, updateTenant } = useTenant();
  const { workshop, updateWorkshop, loading } = useWorkshop();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    services_offered: [] as string[],
    languages_spoken: [] as string[],
    working_hours: {} as any,
    is_public: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (workshop && tenant) {
      setFormData({
        name: workshop.name || '',
        address: workshop.address || '',
        phone: workshop.phone || '',
        email: workshop.email || '',
        services_offered: workshop.services_offered || [],
        languages_spoken: workshop.languages_spoken || [],
        working_hours: workshop.working_hours || {},
        is_public: workshop.is_public || false,
      });
    }
  }, [workshop, tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Update workshop data
    await updateWorkshop({
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      services_offered: formData.services_offered,
      languages_spoken: formData.languages_spoken,
      working_hours: formData.working_hours,
      is_public: formData.is_public,
    });

    // Update tenant name to match workshop name
    if (tenant && formData.name !== tenant.name) {
      await updateTenant({
        name: formData.name,
      });
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['workshop']}>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Building className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Workshop Management</h2>
        </div>
        <p className="text-gray-600">
          Configure your workshop profile, services, and availability
        </p>

        <WorkshopProfileForm
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </RoleGuard>
  );
};

export default WorkshopManager;
