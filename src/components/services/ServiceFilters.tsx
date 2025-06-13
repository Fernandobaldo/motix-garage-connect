
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import type { ServiceFilterState, ServiceStatus } from '@/types/database';

interface ServiceFiltersProps {
  filters: ServiceFilterState;
  onFiltersChange: (filters: ServiceFilterState) => void;
}

const ServiceFilters = ({ filters, onFiltersChange }: ServiceFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Service Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    status: value === 'all' ? undefined : (value as ServiceStatus),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select
                value={filters.dateRange || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    dateRange: value === 'all' ? undefined : (value as any),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Select
                value={filters.serviceType || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    serviceType: value === 'all' ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="oil_change">Oil Change</SelectItem>
                  <SelectItem value="brake_service">Brake Service</SelectItem>
                  <SelectItem value="tire_rotation">Tire Rotation</SelectItem>
                  <SelectItem value="general_maintenance">General Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                placeholder="Search by client name..."
                value={filters.clientName || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    clientName: e.target.value || undefined,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input
                id="licensePlate"
                placeholder="Search by license plate..."
                value={filters.licensePlate || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    licensePlate: e.target.value || undefined,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ServiceFilters;
