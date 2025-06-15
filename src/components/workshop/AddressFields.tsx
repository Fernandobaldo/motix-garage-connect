import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddressFieldsProps {
  address: string;
  onAddressChange: (address: string) => void;
}

interface AddressComponents {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'MA', name: 'Morocco' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
];

// Sort by country name for the dropdown (ascending, A–Z)
const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

const AddressFields = ({ address, onAddressChange }: AddressFieldsProps) => {
  const [components, setComponents] = useState<AddressComponents>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  // Parse existing address on mount and any time address changes
  useEffect(() => {
    if (address) {
      // Expect: "street, city, state, postalCode, countryName"
      const parts = address.split(',').map(part => part.trim());
      const [street, city, state, postalCode, countryName] = [
        parts[0] || '',
        parts[1] || '',
        parts[2] || '',
        parts[3] || '',
        parts[4] || '',
      ];

      // Convert country name back to country code if possible
      let country = 'US';
      if (countryName) {
        const matched = countries.find(c => c.name === countryName);
        if (matched) {
          country = matched.code;
        }
      }

      setComponents({
        street,
        city,
        state,
        postalCode,
        country,
      });
    }
  }, [address]);

  // Update the combined address when components change
  useEffect(() => {
    const addressParts = [
      components.street,
      components.city,
      components.state,
      components.postalCode,
      countries.find(c => c.code === components.country)?.name,
    ].filter(Boolean);

    onAddressChange(addressParts.join(', '));
  }, [components, onAddressChange]);

  const updateComponent = (field: keyof AddressComponents, value: string) => {
    setComponents(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={components.street}
          onChange={(e) => updateComponent('street', e.target.value)}
          placeholder="123 Main Street"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={components.city}
            onChange={(e) => updateComponent('city', e.target.value)}
            placeholder="New York"
          />
        </div>

        <div>
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            value={components.state}
            onChange={(e) => updateComponent('state', e.target.value)}
            placeholder="NY, Ontario, etc."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={components.postalCode}
            onChange={(e) => updateComponent('postalCode', e.target.value)}
            placeholder="10001, K1A 0A6, etc."
          />
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Select value={components.country} onValueChange={(value) => updateComponent('country', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {sortedCountries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AddressFields;
