
import { useState } from 'react';
import CalendarDisplay from './CalendarDisplay';
import AppointmentDetails from './AppointmentDetails';
import { useAppointmentData } from './useAppointmentData';

interface AppointmentCalendarProps {
  userRole: 'client' | 'workshop';
}

const AppointmentCalendar = ({ userRole }: AppointmentCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { appointments, isLoading } = useAppointmentData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {userRole === 'client' ? 'My Calendar' : 'Workshop Calendar'}
        </h2>
        <p className="text-gray-600">
          View appointments in calendar format
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CalendarDisplay
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          appointments={appointments}
        />
        
        <AppointmentDetails
          selectedDate={selectedDate}
          appointments={appointments}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          userRole={userRole}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default AppointmentCalendar;
