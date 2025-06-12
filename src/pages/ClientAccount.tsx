
import ClientLayout from '@/components/layout/ClientLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserProfileTab from '@/components/dashboard/UserProfileTab';

const ClientAccount = () => {
  return (
    <ProtectedRoute requiredRole="client">
      <ClientLayout>
        <UserProfileTab />
      </ClientLayout>
    </ProtectedRoute>
  );
};

export default ClientAccount;
