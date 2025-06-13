
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Car, Wrench, Plus, History, Settings } from 'lucide-react';
import ServiceRecordsList from '../services/ServiceRecordsList';
import ServiceRecordModal from '../vehicles/ServiceRecordModal';
import WorkshopPreferencesModal from '../workshop/WorkshopPreferencesModal';
import type { ServiceRecordWithRelations } from '@/types/database';

const VehicleServiceTab = () => {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

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
