
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import VehicleRegistrationForm from '@/components/vehicles/VehicleRegistrationForm';

interface QuickVehicleAddProps {
  onVehicleAdded: () => void;
}

const QuickVehicleAdd = ({ onVehicleAdded }: QuickVehicleAddProps) => {
  const { profile } = useAuth();

  if (profile?.role !== 'client') {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-blue-300 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-700">
          <Car className="h-5 w-5" />
          <span>Quick Vehicle Registration</span>
        </CardTitle>
        <CardDescription>
          Register your vehicle quickly to book this appointment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VehicleRegistrationForm 
          onVehicleAdded={onVehicleAdded}
          compact={true}
          showHeader={false}
        />
      </CardContent>
    </Card>
  );
};

export default QuickVehicleAdd;
