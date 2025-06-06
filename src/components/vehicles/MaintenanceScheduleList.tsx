
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, Clock, DollarSign, Wrench } from 'lucide-react';
import { MaintenanceSchedule } from './types';
import { format, isAfter, addDays } from 'date-fns';

interface MaintenanceScheduleListProps {
  schedules: MaintenanceSchedule[];
  onMarkCompleted: (schedule: MaintenanceSchedule) => void;
  onEditSchedule: (schedule: MaintenanceSchedule) => void;
}

const MaintenanceScheduleList = ({ schedules, onMarkCompleted, onEditSchedule }: MaintenanceScheduleListProps) => {
  const getPriorityBadge = (priority: string, isOverdue: boolean) => {
    if (isOverdue) return 'destructive';
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: string, isOverdue: boolean) => {
    if (isOverdue || priority === 'critical' || priority === 'high') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Wrench className="h-4 w-4" />;
  };

  const getStatusText = (schedule: MaintenanceSchedule) => {
    if (schedule.is_overdue) return 'Overdue';
    if (schedule.next_due_date && isAfter(new Date(), addDays(new Date(schedule.next_due_date), -7))) {
      return 'Due Soon';
    }
    return 'Scheduled';
  };

  const isUpcoming = (schedule: MaintenanceSchedule) => {
    if (!schedule.next_due_date) return false;
    const dueDate = new Date(schedule.next_due_date);
    const weekFromNow = addDays(new Date(), 7);
    return isAfter(dueDate, new Date()) && !isAfter(dueDate, weekFromNow);
  };

  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No maintenance schedules found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <Card 
          key={schedule.id} 
          className={`hover:shadow-md transition-shadow ${
            schedule.is_overdue ? 'border-red-200 bg-red-50' : 
            isUpcoming(schedule) ? 'border-yellow-200 bg-yellow-50' : ''
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getPriorityIcon(schedule.priority, schedule.is_overdue)}
                <div>
                  <CardTitle className="text-lg">{schedule.service_type}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {schedule.vehicle ? `${schedule.vehicle.year} ${schedule.vehicle.make} ${schedule.vehicle.model}` : 'Unknown Vehicle'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getPriorityBadge(schedule.priority, schedule.is_overdue) as any}>
                  {getStatusText(schedule)}
                </Badge>
                <Badge variant="outline">
                  {schedule.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {schedule.next_due_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Due: {format(new Date(schedule.next_due_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              
              {schedule.next_due_mileage && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {schedule.next_due_mileage.toLocaleString()} miles
                  </span>
                </div>
              )}
              
              {schedule.estimated_cost && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Est. ${schedule.estimated_cost.toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm capitalize">
                  {schedule.interval_type} based
                </span>
              </div>
            </div>
            
            {schedule.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {schedule.description}
              </p>
            )}
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Every {schedule.interval_value} {schedule.interval_type === 'time' ? 'days' : 'miles'}
                {schedule.interval_type === 'both' && schedule.mileage_interval && 
                  ` or ${schedule.mileage_interval} miles`
                }
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEditSchedule(schedule)}
                >
                  Edit
                </Button>
                <Button 
                  variant={schedule.is_overdue ? "destructive" : "default"}
                  size="sm"
                  onClick={() => onMarkCompleted(schedule)}
                >
                  Mark Completed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MaintenanceScheduleList;
