
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Car, User, MapPin, Phone, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ServiceSchedulingProps {
  userRole: 'client' | 'workshop';
}

const ServiceScheduling = ({ userRole }: ServiceSchedulingProps) => {
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    vehicle: '',
    preferredDate: '',
    preferredTime: '',
  });
  const { toast } = useToast();

  const serviceTypes = [
    'Oil Change',
    'Brake Service',
    'Engine Diagnostics',
    'Transmission Service',
    'Air Conditioning',
    'Tire Service',
    'Battery Service',
    'General Inspection',
    'Custom Service'
  ];

  const mockAppointments = userRole === 'client' ? [
    {
      id: 1,
      serviceType: 'Oil Change',
      vehicle: '2020 Honda Civic',
      date: '2024-06-08',
      time: '10:00 AM',
      status: 'confirmed',
      workshop: 'AutoCare Plus',
      description: 'Regular oil change service'
    },
    {
      id: 2,
      serviceType: 'Brake Service',
      vehicle: '2018 Toyota Camry',
      date: '2024-06-10',
      time: '2:00 PM',
      status: 'pending',
      workshop: 'City Motors',
      description: 'Brake pad replacement needed'
    }
  ] : [
    {
      id: 1,
      serviceType: 'Engine Diagnostics',
      client: 'John Smith',
      vehicle: '2019 Ford F-150',
      date: '2024-06-08',
      time: '9:00 AM',
      status: 'in_progress',
      phone: '+1 (555) 123-4567',
      description: 'Engine making unusual noise'
    },
    {
      id: 2,
      serviceType: 'Oil Change',
      client: 'Sarah Johnson',
      vehicle: '2021 BMW X3',
      date: '2024-06-08',
      time: '11:00 AM',
      status: 'awaiting_parts',
      phone: '+1 (555) 987-6543',
      description: 'Routine maintenance'
    },
    {
      id: 3,
      serviceType: 'Transmission Service',
      client: 'Mike Davis',
      vehicle: '2017 Chevrolet Malibu',
      date: '2024-06-09',
      time: '3:00 PM',
      status: 'pending',
      phone: '+1 (555) 456-7890',
      description: 'Transmission fluid change'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'awaiting_parts': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: userRole === 'client' ? "Service Requested!" : "Appointment Scheduled!",
      description: userRole === 'client' 
        ? "Your service request has been sent to the workshop." 
        : "New appointment has been added to your calendar.",
    });

    setShowNewServiceForm(false);
    setFormData({
      serviceType: '',
      description: '',
      vehicle: '',
      preferredDate: '',
      preferredTime: '',
    });
  };

  const updateAppointmentStatus = (id: number, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Appointment status changed to ${newStatus.replace('_', ' ')}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {userRole === 'client' ? 'My Appointments' : 'Service Calendar'}
          </h2>
          <p className="text-gray-600">
            {userRole === 'client' 
              ? 'Manage your service appointments and requests' 
              : 'View and manage all workshop appointments'}
          </p>
        </div>
        <Button 
          onClick={() => setShowNewServiceForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {userRole === 'client' ? 'Request Service' : 'New Appointment'}
        </Button>
      </div>

      {/* New Service Form */}
      {showNewServiceForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {userRole === 'client' ? 'Request New Service' : 'Schedule New Appointment'}
            </CardTitle>
            <CardDescription>
              Fill out the details below to schedule a service appointment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vehicle">Vehicle</Label>
                  <Select value={formData.vehicle} onValueChange={(value) => handleInputChange('vehicle', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2020-honda-civic">2020 Honda Civic</SelectItem>
                      <SelectItem value="2018-toyota-camry">2018 Toyota Camry</SelectItem>
                      <SelectItem value="2019-ford-f150">2019 Ford F-150</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="preferredTime">Preferred Time</Label>
                  <Input
                    id="preferredTime"
                    type="time"
                    value={formData.preferredTime}
                    onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue or service needed..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {userRole === 'client' ? 'Submit Request' : 'Schedule Appointment'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewServiceForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Appointments List */}
      <div className="grid gap-4">
        {mockAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {appointment.serviceType}
                    </h3>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span>{appointment.vehicle}</span>
                    </div>
                    {userRole === 'client' ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{(appointment as any).workshop}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{(appointment as any).client}</span>
                      </div>
                    )}
                  </div>

                  {userRole === 'workshop' && (appointment as any).phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{(appointment as any).phone}</span>
                    </div>
                  )}

                  <p className="text-sm text-gray-700">{appointment.description}</p>
                </div>

                <div className="flex gap-2 ml-4">
                  {userRole === 'workshop' && (
                    <Select
                      value={appointment.status}
                      onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="awaiting_parts">Awaiting Parts</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceScheduling;
