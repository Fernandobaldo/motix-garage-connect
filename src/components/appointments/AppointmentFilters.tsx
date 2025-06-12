
import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import LicensePlateFilter from '../common/LicensePlateFilter';
import { debounce } from 'lodash';

export interface AppointmentFilterState {
  status?: string;
  serviceType?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  clientName?: string;
  licensePlate?: string;
}

interface AppointmentFiltersProps {
  filters: AppointmentFilterState;
  onFiltersChange: (filters: AppointmentFilterState) => void;
  showAdvanced?: boolean;
}

const AppointmentFilters = ({ filters, onFiltersChange, showAdvanced = false }: AppointmentFiltersProps) => {
  const [showFilters, setShowFilters] = useState(showAdvanced);

  // Debounced client name search
  const debouncedClientNameFilter = useCallback(
    debounce((value: string) => {
      onFiltersChange({
        ...filters,
        clientName: value.trim() || undefined,
      });
    }, 300),
    [filters, onFiltersChange]
  );

  const handleClientNameChange = (value: string) => {
    debouncedClientNameFilter(value);
  };

  const handleLicensePlateChange = (value: string) => {
    onFiltersChange({
      ...filters,
      licensePlate: value || undefined,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value,
    });
  };

  const handleServiceTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      serviceType: value === 'all' ? undefined : value,
    });
  };

  const handleDateRangeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: value === 'all' ? undefined : (value as any),
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const serviceTypes = [
    'Oil Change',
    'Brake Service',
    'Tire Rotation',
    'Engine Tune-up',
    'Transmission Service',
    'Battery Service',
    'Air Filter Replacement',
    'Brake Pad Replacement',
    'Coolant Service',
    'Other',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
          {/* Client Name Search */}
          <div className="space-y-2">
            <Label htmlFor="client-search">Client Name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="client-search"
                placeholder="Search by client name..."
                onChange={(e) => handleClientNameChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* License Plate Filter */}
          <LicensePlateFilter
            onFilterChange={handleLicensePlateChange}
            placeholder="Search by license plate..."
            label="License Plate"
          />

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Service Type Filter */}
          <div className="space-y-2">
            <Label>Service Type</Label>
            <Select value={filters.serviceType || 'all'} onValueChange={handleServiceTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="All services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {serviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={filters.dateRange || 'all'} onValueChange={handleDateRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="All dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>Status: {filters.status}</span>
              <button
                onClick={() => handleStatusChange('all')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.serviceType && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>Service: {filters.serviceType}</span>
              <button
                onClick={() => handleServiceTypeChange('all')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateRange && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>Date: {filters.dateRange}</span>
              <button
                onClick={() => handleDateRangeChange('all')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.clientName && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>Client: {filters.clientName}</span>
              <button
                onClick={() => onFiltersChange({ ...filters, clientName: undefined })}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.licensePlate && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>Plate: {filters.licensePlate}</span>
              <button
                onClick={() => handleLicensePlateChange('')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentFilters;
