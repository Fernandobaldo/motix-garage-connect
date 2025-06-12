
import ClientLayout from '@/components/layout/ClientLayout';
import ClientAppointmentView from '@/components/client/ClientAppointmentView';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const ClientAppointments = () => {
  return (
    <ProtectedRoute requiredRole="client">
      <ClientLayout>
        <ClientAppointmentView />
      </ClientLayout>
    </ProtectedRoute>
  );
};

export default ClientAppointments;
