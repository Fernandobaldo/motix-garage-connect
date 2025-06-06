
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Edit, Trash2, Fuel, Calendar, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface VehicleListProps {
  onEditVehicle?: (vehicle: Vehicle) => void;
  onVehicleUpdated?: () => void;
  compact?: boolean;
}

const VehicleList = ({ onEditVehicle, onVehicleUpdated, compact = false }: VehicleListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading vehicles:', error);
        return;
      }

      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [user]);

  const deleteVehicle = async (vehicleId: string, vehicleName: string) => {
    if (!confirm(`Are you sure you want to delete ${vehicleName}? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) {
        toast({
          title: 'Delete Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Vehicle Deleted',
        description: `${vehicleName} has been removed from your garage.`
      });

      loadVehicles();
      onVehicleUpdated?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vehicles Yet</h3>
          <p className="text-gray-500 mb-6">
            Register your first vehicle to start booking service appointments with local workshops.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      {vehicles.map((vehicle) => (
        <Card key={vehicle.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Car className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    {vehicle.year} {vehicle.make}
                  </CardTitle>
                  <p className="text-sm text-gray-600 font-medium">{vehicle.model}</p>
                </div>
              </div>
              {!compact && (
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEditVehicle?.(vehicle)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteVehicle(vehicle.id, `${vehicle.year} ${vehicle.make} ${vehicle.model}`)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">License Plate</span>
              <Badge variant="outline" className="font-mono font-bold">
                {vehicle.license_plate}
              </Badge>
            </div>

            {(vehicle.fuel_type || vehicle.transmission) && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {vehicle.fuel_type && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Fuel className="h-3 w-3" />
                    <span>{vehicle.fuel_type}</span>
                  </div>
                )}
                {vehicle.transmission && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Settings className="h-3 w-3" />
                    <span>{vehicle.transmission}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Added {new Date(vehicle.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VehicleList;
