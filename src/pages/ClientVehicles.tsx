
import ClientLayout from '@/components/layout/ClientLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import VehicleManager from '@/components/appointments/VehicleManager';

const ClientVehicles = () => {
  return (
    <ProtectedRoute requiredRole="client">
      <ClientLayout>
        <VehicleManager />
      </ClientLayout>
    </ProtectedRoute>
  );
};

export default ClientVehicles;
