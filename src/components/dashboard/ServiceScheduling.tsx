
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Calendar, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AppointmentBooking from "../appointments/AppointmentBooking";
import AppointmentList from "../appointments/AppointmentList";
import AppointmentCalendar from "../appointments/AppointmentCalendar";

interface ServiceSchedulingProps {
  userRole: 'client' | 'workshop';
}

const ServiceScheduling = ({ userRole }: ServiceSchedulingProps) => {
  const { profile } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [appointmentView, setAppointmentView] = useState('upcoming');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="text-gray-600">Manage your service appointments</p>
        </div>
        {userRole === 'client' && (
          <Button onClick={() => setShowBookingModal(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Appointment</span>
          </Button>
        )}
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Upcoming</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Calendar View</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <AppointmentList filter="upcoming" />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <AppointmentList filter="history" />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <AppointmentCalendar userRole={userRole} />
        </TabsContent>
      </Tabs>

      {/* New Appointment Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
            <DialogDescription>
              Schedule a service appointment for your vehicle
            </DialogDescription>
          </DialogHeader>
          <AppointmentBooking onSuccess={() => setShowBookingModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceScheduling;
