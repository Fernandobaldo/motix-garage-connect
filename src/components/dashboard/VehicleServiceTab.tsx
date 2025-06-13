
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Car, Wrench, Plus, History, Settings } from 'lucide-react';
import ServiceRecordsList from '../services/ServiceRecordsList';
import ServiceRecordModal from '../vehicles/ServiceRecordModal';
import WorkshopPreferencesModal from '../workshop/WorkshopPreferencesModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { ServiceRecordWithRelations } from '@/types/database';

const VehicleServiceTab = () => {
  const { profile } = useAuth();
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Fetch vehicles for service creation
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-for-service', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return [];

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id,
  });

  const handlePdfExport = async (service: ServiceRecordWithRelations) => {
    // PDF export functionality will be implemented here
    console.log('Exporting PDF for service:', service.id);
    // This would call a PDF generation service
  };

  const handleServiceCreated = () => {
    setShowServiceModal(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Car className="h-6 w-6" />
                <span>Vehicle Service & Maintenance</span>
              </CardTitle>
              <CardDescription>
                Comprehensive tracking of vehicle service history, maintenance schedules, and health reports
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreferencesModal(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Preferences
              </Button>
              <Button
                onClick={() => setShowServiceModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Service
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <Wrench className="h-4 w-4" />
            <span>Active Services</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Service History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ServiceRecordsList
            filter="active"
            onCreateNew={() => setShowServiceModal(true)}
            onPdfExport={handlePdfExport}
          />
        </TabsContent>

        <TabsContent value="history">
          <ServiceRecordsList
            filter="history"
            onPdfExport={handlePdfExport}
          />
        </TabsContent>
      </Tabs>

      {/* Service Creation Modal */}
      <ServiceRecordModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSuccess={handleServiceCreated}
        vehicles={vehicles}
      />

      {/* Workshop Preferences Modal */}
      <WorkshopPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
      />
    </div>
  );
};

export default VehicleServiceTab;
