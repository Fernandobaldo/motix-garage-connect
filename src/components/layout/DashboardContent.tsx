
import { TabsContent } from "@/components/ui/tabs";
import ServiceScheduling from "@/components/dashboard/ServiceScheduling";
import UserProfileTab from "@/components/dashboard/UserProfileTab";
import VehicleServiceTab from "@/components/dashboard/VehicleServiceTab";
import QuotationManager from "@/components/dashboard/QuotationManager";
import ChatInterface from "@/components/chat/ChatInterface";
import VehicleManager from "@/components/appointments/VehicleManager";
import ClientsManager from "@/components/clients/ClientsManager";

interface DashboardContentProps {
  userRole: 'client' | 'workshop';
  selectedAppointmentId: string | null;
}

const DashboardContent = ({ userRole, selectedAppointmentId }: DashboardContentProps) => {
  return (
    <>
      <TabsContent value="appointments">
        <ServiceScheduling userRole={userRole} />
      </TabsContent>

      <TabsContent value="services">
        <VehicleServiceTab />
      </TabsContent>

      {userRole === 'client' && (
        <TabsContent value="vehicles">
          <VehicleManager />
        </TabsContent>
      )}

      {userRole === 'workshop' && (
        <TabsContent value="clients">
          <ClientsManager />
        </TabsContent>
      )}

      <TabsContent value="messages">
        <ChatInterface appointmentId={selectedAppointmentId} />
      </TabsContent>

      <TabsContent value="quotations">
        <QuotationManager userRole={userRole} />
      </TabsContent>

      <TabsContent value="profile">
        <UserProfileTab />
      </TabsContent>
    </>
  );
};

export default DashboardContent;
