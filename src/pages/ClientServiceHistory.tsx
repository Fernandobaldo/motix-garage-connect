
import ClientLayout from '@/components/layout/ClientLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import VehicleServiceTab from '@/components/dashboard/VehicleServiceTab';

const ClientServiceHistory = () => {
  return (
    <ProtectedRoute requiredRole="client">
      <ClientLayout>
        <VehicleServiceTab />
      </ClientLayout>
    </ProtectedRoute>
  );
};

export default ClientServiceHistory;
