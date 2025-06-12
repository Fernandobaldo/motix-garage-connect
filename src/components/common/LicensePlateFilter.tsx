
import { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { debounce } from 'lodash';

interface LicensePlateFilterProps {
  onFilterChange: (filter: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const LicensePlateFilter = ({ 
  onFilterChange, 
  placeholder = "Search by license plate...", 
  label = "License Plate Filter",
  className = ""
}: LicensePlateFilterProps) => {
  const [filterValue, setFilterValue] = useState('');

  // Debounced filter function to avoid excessive API calls
  const debouncedFilter = useCallback(
    debounce((value: string) => {
      // Case-insensitive and trimmed filter
      const cleanValue = value.trim().toLowerCase();
      onFilterChange(cleanValue);
    }, 300),
    [onFilterChange]
  );

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    debouncedFilter(value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="license-plate-filter" className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          id="license-plate-filter"
          type="text"
          placeholder={placeholder}
          value={filterValue}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default LicensePlateFilter;
