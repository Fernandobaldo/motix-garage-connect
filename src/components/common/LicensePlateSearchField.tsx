
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Car, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Vehicle {
  vehicle_id: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  client_id: string;
  client_name: string;
  client_type: 'auth' | 'guest';
}

interface LicensePlateSearchFieldProps {
  label?: string;
  placeholder?: string;
  onVehicleSelect: (vehicle: Vehicle) => void;
  onClientSelect?: (clientId: string, clientName: string, clientType: 'auth' | 'guest') => void;
  value?: string;
  className?: string;
  required?: boolean;
}

const LicensePlateSearchField = ({
  label = "License Plate",
  placeholder = "Enter license plate number...",
  onVehicleSelect,
  onClientSelect,
  value = "",
  className = "",
  required = false
}: LicensePlateSearchFieldProps) => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState(value);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchVehicles(searchTerm);
      }, 300);
    } else {
      setVehicles([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const searchVehicles = async (term: string) => {
    if (!profile?.tenant_id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_vehicles_by_plate', {
        p_tenant_id: profile.tenant_id,
        p_search_term: term
      });

      if (error) {
        console.error('Error searching vehicles:', error);
        setVehicles([]);
      } else {
        setVehicles(data || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error in vehicle search:', error);
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSearchTerm(vehicle.license_plate);
    setShowResults(false);
    onVehicleSelect(vehicle);
    
    if (onClientSelect) {
      onClientSelect(vehicle.client_id, vehicle.client_name, vehicle.client_type);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setSearchTerm(newValue);
    setSelectedVehicle(null);
  };

  const clearSelection = () => {
    setSearchTerm('');
    setSelectedVehicle(null);
    setShowResults(false);
    setVehicles([]);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Label htmlFor="license-plate-search">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative mt-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        
        <Input
          id="license-plate-search"
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        
        {selectedVehicle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute inset-y-0 right-0 px-2"
            onClick={clearSelection}
          >
            ×
          </Button>
        )}
      </div>

      {selectedVehicle && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start space-x-3">
            <Car className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-800">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <User className="h-3 w-3 text-green-600" />
                <p className="text-sm text-green-700">
                  Owner: {selectedVehicle.client_name}
                  {selectedVehicle.client_type === 'guest' && (
                    <span className="ml-1 text-xs bg-green-100 px-1 rounded">Guest</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResults && vehicles.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.vehicle_id}
                type="button"
                className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 focus:bg-gray-50 focus:outline-none"
                onClick={() => handleVehicleClick(vehicle)}
              >
                <div className="flex items-start space-x-3">
                  <Car className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {vehicle.license_plate}
                    </p>
                    <p className="text-sm text-gray-600">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        {vehicle.client_name}
                        {vehicle.client_type === 'guest' && (
                          <span className="ml-1 bg-gray-100 px-1 rounded">Guest</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {showResults && vehicles.length === 0 && !isLoading && searchTerm.length >= 2 && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg">
          <CardContent className="p-4 text-center text-gray-500">
            <Car className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No vehicles found with plate "{searchTerm}"</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LicensePlateSearchField;
