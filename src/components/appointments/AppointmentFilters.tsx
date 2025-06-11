
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface AppointmentFiltersProps {
  onFilterChange: (filters: AppointmentFilterState) => void;
  workshops?: Array<{ id: string; name: string }>;
  showWorkshopFilter?: boolean;
}

export interface AppointmentFilterState {
  status?: string;
  workshop?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  serviceType?: string;
}

const AppointmentFilters = ({ onFilterChange, workshops = [], showWorkshopFilter = true }: AppointmentFiltersProps) => {
  const [filters, setFilters] = useState<AppointmentFilterState>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  const serviceTypeOptions = [
    'Oil Change',
    'Brake Service',
    'Tire Service',
    'Engine Diagnostics',
    'Transmission Service',
    'Battery Service',
    'General Maintenance',
    'Emergency Repair',
  ];

  const updateFilters = (newFilters: Partial<AppointmentFilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && 
    !(typeof value === 'object' && Object.values(value).every(v => v === undefined))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Status Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-700">Status</label>
          <Select value={filters.status || ''} onValueChange={(value) => updateFilters({ status: value || undefined })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]}`} />
                    <span>{status.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Workshop Filter */}
        {showWorkshopFilter && workshops.length > 0 && (
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium text-gray-700">Workshop</label>
            <Select value={filters.workshop || ''} onValueChange={(value) => updateFilters({ workshop: value || undefined })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All workshops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All workshops</SelectItem>
                {workshops.map((workshop) => (
                  <SelectItem key={workshop.id} value={workshop.id}>
                    {workshop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Service Type Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-700">Service Type</label>
          <Select value={filters.serviceType || ''} onValueChange={(value) => updateFilters({ serviceType: value || undefined })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All services</SelectItem>
              {serviceTypeOptions.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-700">Date Range</label>
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-48 justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd")} -{" "}
                      {format(filters.dateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange?.from}
                selected={filters.dateRange}
                onSelect={(range) => updateFilters({ dateRange: range })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="mt-6">
            <X className="h-4 w-4 mr-2" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {statusOptions.find(s => s.value === filters.status)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ status: undefined })}
              />
            </Badge>
          )}
          {filters.workshop && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Workshop: {workshops.find(w => w.id === filters.workshop)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ workshop: undefined })}
              />
            </Badge>
          )}
          {filters.serviceType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Service: {filters.serviceType}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ serviceType: undefined })}
              />
            </Badge>
          )}
          {filters.dateRange?.from && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {format(filters.dateRange.from, "MMM dd")}
              {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM dd")}`}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ dateRange: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentFilters;
