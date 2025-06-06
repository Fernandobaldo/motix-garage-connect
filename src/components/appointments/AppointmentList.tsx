
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, User, Car, Phone, MapPin, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useAppointmentData } from "./useAppointmentData";
import type { DatabaseAppointment } from "./types";

const AppointmentList = () => {
  const { appointments, isLoading } = useAppointmentData();
  const [selectedAppointment, setSelectedAppointment] = useState<DatabaseAppointment | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500">
                You don't have any appointments scheduled yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          appointments.map((apt: DatabaseAppointment) => (
            <Card key={apt.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6" onClick={() => setSelectedAppointment(apt)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(apt.status)}
                      <h3 className="font-semibold text-gray-900">{apt.service_type}</h3>
                      <Badge className={getStatusColor(apt.status)}>
                        {apt.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(apt.scheduled_at), 'PPP p')}</span>
                      </div>
                      
                      {apt.duration_minutes && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{apt.duration_minutes} minutes</span>
                        </div>
                      )}
                      
                      {apt.client && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{apt.client.full_name}</span>
                          {apt.client.phone && <span>• {apt.client.phone}</span>}
                        </div>
                      )}
                      
                      {apt.workshop && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{apt.workshop.name}</span>
                          {apt.workshop.phone && <span>• {apt.workshop.phone}</span>}
                        </div>
                      )}
                      
                      {apt.vehicle && (
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4" />
                          <span>
                            {apt.vehicle.year} {apt.vehicle.make} {apt.vehicle.model} 
                            • {apt.vehicle.license_plate}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {apt.description && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {apt.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedAppointment && getStatusIcon(selectedAppointment.status)}
              <span>{selectedAppointment?.service_type}</span>
            </DialogTitle>
            <DialogDescription>
              Appointment details and information
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date & Time</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{format(new Date(selectedAppointment.scheduled_at), 'PPP p')}</span>
                    </div>
                  </div>
                  
                  {selectedAppointment.duration_minutes && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Duration</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{selectedAppointment.duration_minutes} minutes</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedAppointment.status)}>
                        {selectedAppointment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {selectedAppointment.client && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Client</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{selectedAppointment.client.full_name}</span>
                      </div>
                      {selectedAppointment.client.phone && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{selectedAppointment.client.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedAppointment.workshop && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Workshop</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{selectedAppointment.workshop.name}</span>
                      </div>
                      {selectedAppointment.workshop.phone && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{selectedAppointment.workshop.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedAppointment.vehicle && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Vehicle</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span>
                          {selectedAppointment.vehicle.year} {selectedAppointment.vehicle.make} {selectedAppointment.vehicle.model}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        License Plate: {selectedAppointment.vehicle.license_plate}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedAppointment.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {selectedAppointment.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentList;
