
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, MessageSquare, FileText, Car, Building, Wrench, Users } from "lucide-react";

interface DashboardTabsProps {
  userRole: 'client' | 'workshop';
}

const DashboardTabs = ({ userRole }: DashboardTabsProps) => {
  if (userRole === 'client') {
    return (
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="appointments" className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Appointments</span>
        </TabsTrigger>

        <TabsTrigger value="services" className="flex items-center space-x-2">
          <Wrench className="h-4 w-4" />
          <span>Service Records</span>
        </TabsTrigger>

        <TabsTrigger value="vehicles" className="flex items-center space-x-2">
          <Car className="h-4 w-4" />
          <span>My Vehicles</span>
        </TabsTrigger>

        <TabsTrigger value="messages" className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4" />
          <span>Messages</span>
        </TabsTrigger>

        <TabsTrigger value="quotations" className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Quotations</span>
        </TabsTrigger>

        <TabsTrigger value="profile" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>Profile</span>
        </TabsTrigger>
      </TabsList>
    );
  }

  return (
    <TabsList className="grid w-full grid-cols-6">
      <TabsTrigger value="appointments" className="flex items-center space-x-2">
        <Calendar className="h-4 w-4" />
        <span>Appointments</span>
      </TabsTrigger>

      <TabsTrigger value="services" className="flex items-center space-x-2">
        <Wrench className="h-4 w-4" />
        <span>Service Records</span>
      </TabsTrigger>

      <TabsTrigger value="clients" className="flex items-center space-x-2">
        <Users className="h-4 w-4" />
        <span>Clients</span>
      </TabsTrigger>

      <TabsTrigger value="messages" className="flex items-center space-x-2">
        <MessageSquare className="h-4 w-4" />
        <span>Messages</span>
      </TabsTrigger>

      <TabsTrigger value="quotations" className="flex items-center space-x-2">
        <FileText className="h-4 w-4" />
        <span>Quotations</span>
      </TabsTrigger>

      <TabsTrigger value="profile" className="flex items-center space-x-2">
        <User className="h-4 w-4" />
        <span>Profile</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default DashboardTabs;
