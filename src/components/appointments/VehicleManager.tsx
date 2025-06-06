
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Plus, List, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import VehicleRegistrationForm from '@/components/vehicles/VehicleRegistrationForm';
import VehicleList from '@/components/vehicles/VehicleList';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  fuel_type: string;
  transmission: string;
  created_at: string;
}

const VehicleManager = () => {
  const { profile } = useAuth();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleVehicleAdded = () => {
    setShowRegistrationForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowRegistrationForm(true);
  };

  const handleVehicleUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (profile?.role !== 'client') {
    return (
      <div className="text-center py-12">
        <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Workshop Vehicle Database</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Vehicle management is currently designed for client users. Workshop owners can view client vehicles through appointment management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Car className="h-8 w-8 text-blue-600" />
            My Vehicles
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your vehicles to book service appointments with trusted workshops
          </p>
        </div>
        
        <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Register Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingVehicle ? <Car className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                {editingVehicle ? 'Edit Vehicle' : 'Register New Vehicle'}
              </DialogTitle>
              <DialogDescription>
                {editingVehicle 
                  ? 'Update your vehicle information.' 
                  : 'Add a new vehicle to start booking service appointments.'
                }
              </DialogDescription>
            </DialogHeader>
            <VehicleRegistrationForm 
              onVehicleAdded={handleVehicleAdded}
              showHeader={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicle Gallery
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Detailed List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <VehicleList 
            key={`grid-${refreshKey}`}
            onEditVehicle={handleEditVehicle}
            onVehicleUpdated={handleVehicleUpdated}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <VehicleList 
            key={`list-${refreshKey}`}
            onEditVehicle={handleEditVehicle}
            onVehicleUpdated={handleVehicleUpdated}
            compact={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleManager;
