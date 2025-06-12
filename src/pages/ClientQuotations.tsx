
import ClientLayout from '@/components/layout/ClientLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import QuotationManager from '@/components/dashboard/QuotationManager';

const ClientQuotations = () => {
  return (
    <ProtectedRoute requiredRole="client">
      <ClientLayout>
        <QuotationManager userRole="client" />
      </ClientLayout>
    </ProtectedRoute>
  );
};

export default ClientQuotations;
