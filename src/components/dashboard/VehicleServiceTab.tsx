
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VehicleServiceDashboard from '../vehicles/VehicleServiceDashboard';
import { Car, Wrench } from 'lucide-react';

const VehicleServiceTab = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="h-6 w-6" />
            <span>Vehicle Service & Maintenance</span>
          </CardTitle>
          <CardDescription>
            Comprehensive tracking of vehicle service history, maintenance schedules, and health reports
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <Wrench className="h-4 w-4" />
            <span>Service Dashboard</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <VehicleServiceDashboard
            selectedVehicleId={selectedVehicleId}
            onVehicleChange={setSelectedVehicleId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleServiceTab;
