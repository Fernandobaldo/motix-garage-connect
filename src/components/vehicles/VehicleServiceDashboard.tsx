
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Calendar, Car, FileText, Plus, Wrench } from 'lucide-react';
import { useServiceHistory } from './useServiceHistory';
import { useAppointmentData } from '../appointments/useAppointmentData';
import ServiceHistoryList from './ServiceHistoryList';
import MaintenanceScheduleList from './MaintenanceScheduleList';
import VehicleHealthReports from './VehicleHealthReports';
import ServiceRecordModal from './ServiceRecordModal';
import ServiceHistoryDetailModal from './ServiceHistoryDetailModal';
import LicensePlateFilter from '../common/LicensePlateFilter';
import { ServiceHistoryRecord, MaintenanceSchedule, VehicleHealthReport } from './types';

interface VehicleServiceDashboardProps {
  selectedVehicleId?: string;
  onVehicleChange?: (vehicleId: string) => void;
}

const VehicleServiceDashboard = ({ selectedVehicleI


onVehicleChange }: VehicleServiceDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showServiceRecordModal, setShowServiceRecordModal] = useState(false);
  const [showServiceDetailModal, setShowServiceDetailModal] = useState(false);
  const [selectedServiceRecord, setSelectedServiceRecord] = useState<ServiceHistoryRecord | null>(null);
  const [licensePlateFilter, setLicensePlateFilter] = useState('');
  
  const { appointments } = useAppointmentData();
  
  const {
    serviceHistory,
    maintenanceSchedules,
    healthReports,
    overdueSchedules,
    upcomingSchedules,
    isLoading,
    addServiceRecord,
    addMaintenanceSchedule,
    addHealthReport,
    updateMaintenanceSchedule,
  } = useServiceHistory(selectedVehicleId);

  // Group vehicles from appointments
  const vehicleMap = new Map();
  appointments?.forEach(appointment => {
    if (appointment.vehicle) {
      vehicleMap.set(appointment.vehicle.id, {
        vehicle: appointment.vehicle,
        appointments: vehicleMap.get(appointment.vehicle.id)?.appointments || []
      });
      vehicleMap.get(appointment.vehicle.id).appointments.push(appointment);
    }
  });
  
  const vehicles = Array.from(vehicleMap.values());

  // Filter vehicles by license plate
  const filteredVehicles = vehicles.filter(({ vehicle }) => {
    if (!licensePlateFilter) return true;
    return vehicle.license_plate.toLowerCase().includes(licensePlateFilter);
  });

  // Filter service history by license plate
  const filteredServiceHistory = serviceHistory.filter(record => {
    if (!licensePlateFilter) return true;
    return record.vehicle?.license_plate?.toLowerCase().includes(licensePlateFilter);
  });

  // Filter maintenance schedules by license plate
  const filteredMaintenanceSchedules = maintenanceSchedules.filter(schedule => {
    if (!licensePlateFilter) return true;
    return schedule.vehicle?.license_plate?.toLowerCase().includes(licensePlateFilter);
  });

  const handleViewServiceDetails = (record: ServiceHistoryRecord) => {
    setSelectedServiceRecord(record);
    setShowServiceDetailModal(true);
  };

  const handleMarkScheduleCompleted = (schedule: MaintenanceSchedule) => {
    console.log('Mark schedule completed:', schedule);
    // TODO: Implement mark as completed functionality
  };

  const handleEditSchedule = (schedule: MaintenanceSchedule) => {
    console.log('Edit schedule:', schedule);
    // TODO: Implement edit schedule modal/form
  };

  const handleViewHealthReport = (report: VehicleHealthReport) => {
    console.log('View health report:', report);
    // TODO: Implement health report details modal/page
  };

  const handleCreateHealthReport = () => {
    console.log('Create health report');
    // TODO: Implement create health report modal/form
  };

  const handleAddServiceRecord = () => {
    setShowServiceRecordModal(true);
  };

  const handleServiceRecordSuccess = () => {
    setShowServiceRecordModal(false);
    // Refresh service history data
    window.location.reload(); // Simple refresh for now
  };

  const getOverallVehicleStats = () => {
    const totalServices = filteredServiceHistory.length;
    const totalOverdue = overdueSchedules.filter(schedule => 
      !licensePlateFilter || schedule.vehicle?.license_plate?.toLowerCase().includes(licensePlateFilter)
    ).length;
    const totalUpcoming = upcomingSchedules.filter(schedule => 
      !licensePlateFilter || schedule.vehicle?.license_plate?.toLowerCase().includes(licensePlateFilter)
    ).length;
    const latestReport = healthReports.find(report => 
      !licensePlateFilter || report.vehicle?.license_plate?.toLowerCase().includes(licensePlateFilter)
    );
    
    return {
      totalServices,
      totalOverdue,
      totalUpcoming,
      healthScore: latestReport?.overall_health_score || null,
    };
  };

  const stats = getOverallVehicleStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Wrench className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading vehicle service data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vehicle Selection and License Plate Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        {vehicles.length > 1 && (
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Vehicle:</label>
            <Select value={selectedVehicleId || ''} onValueChange={onVehicleChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Vehicles</SelectItem>
                {vehicles.map(({ vehicle }) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <LicensePlateFilter
          onFilterChange={setLicensePlateFilter}
          placeholder="Filter by license plate..."
          label="Filter Vehicles"
          className="flex-1 max-w-md"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.totalServices}</p>
              <p className="text-xs text-muted-foreground">Service Records</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.totalOverdue}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Calendar className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.totalUpcoming}</p>
              <p className="text-xs text-muted-foreground">Due Soon</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Car className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">
                {stats.healthScore ? `${stats.healthScore}%` : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">Health Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Service History</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="health">Health Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Add Service Record Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <Button onClick={handleAddServiceRecord}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service Record
            </Button>
          </div>

          {/* Overdue Maintenance Alert */}
          {overdueSchedules.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Overdue Maintenance ({overdueSchedules.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueSchedules.slice(0, 3).map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <p className="font-medium">{schedule.service_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.vehicle?.year} {schedule.vehicle?.make} {schedule.vehicle?.model}
                        </p>
                      </div>
                      <Badge variant="destructive">Overdue</Badge>
                    </div>
                  ))}
                  {overdueSchedules.length > 3 && (
                    <p className="text-sm text-red-600">
                      + {overdueSchedules.length - 3} more overdue items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Maintenance */}
          {upcomingSchedules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Maintenance ({upcomingSchedules.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MaintenanceScheduleList
                  schedules={upcomingSchedules.slice(0, 5)}
                  onMarkCompleted={handleMarkScheduleCompleted}
                  onEditSchedule={handleEditSchedule}
                />
              </CardContent>
            </Card>
          )}

          {/* Recent Service History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Recent Service History
                </span>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('history')}>
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceHistoryList
                records={serviceHistory.slice(0, 3)}
                onViewDetails={handleViewServiceDetails}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Service History</h3>
          </div>
          <ServiceHistoryList
            records={filteredServiceHistory}
            onViewDetails={handleViewServiceDetails}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Maintenance Schedules</h3>
            <Button onClick={() => console.log('Add maintenance schedule')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>
          <MaintenanceScheduleList
            schedules={filteredMaintenanceSchedules}
            onMarkCompleted={handleMarkScheduleCompleted}
            onEditSchedule={handleEditSchedule}
          />
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <VehicleHealthReports
            reports={healthReports}
            onViewReport={handleViewHealthReport}
            onCreateReport={handleCreateHealthReport}
          />
        </TabsContent>
      </Tabs>

      {/* Service Record Modal */}
      <ServiceRecordModal
        isOpen={showServiceRecordModal}
        onClose={() => setShowServiceRecordModal(false)}
        onSuccess={handleServiceRecordSuccess}
        vehicles={filteredVehicles.map(({ vehicle }) => vehicle)}
        preselectedVehicleId={selectedVehicleId}
      />

      {/* Service Detail Modal */}
      <ServiceHistoryDetailModal
        isOpen={showServiceDetailModal}
        onClose={() => setShowServiceDetailModal(false)}
        record={selectedServiceRecord}
      />
    </div>
  );
};

export default VehicleServiceDashboard;
