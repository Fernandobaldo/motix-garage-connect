
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/utils/countries";

interface AddressFieldsProps {
  address: any; // Accepts object or string for backward compatibility
  onAddressChange: (address: object) => void;
}

interface AddressComponents {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string; // country code
}

const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

// Helper for legacy comma addresses (for compatibility only)
function parseLegacyAddress(address: string): AddressComponents {
  const parts = typeof address === "string" ? address.split(",").map((p) => p.trim()) : [];
  const [street, city, state, postalCode, countryName] = [
    parts[0] || "",
    parts[1] || "",
    parts[2] || "",
    parts[3] || "",
    parts[4] || "",
  ];
  let country = "US";
  if (countryName) {
    const matched = countries.find((c) => c.name === countryName);
    if (matched) country = matched.code;
  }
  return { street, city, state, postalCode, country };
}

// Backward compatible loader: accepts object OR string
function parseAddress(addr: any): AddressComponents {
  if (
    typeof addr === "object" &&
    addr !== null &&
    "street" in addr &&
    "city" in addr &&
    "state" in addr &&
    "postalCode" in addr &&
    "country" in addr
  ) {
    return {
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "US",
    };
  } else if (typeof addr === "string") {
    return parseLegacyAddress(addr);
  }
  // fallback default
  return {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  };
}

function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return (...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

const AddressFields = ({ address, onAddressChange }: AddressFieldsProps) => {
  const [components, setComponents] = useState<AddressComponents>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  // Parse address prop on mount or when it changes
  useEffect(() => {
    setComponents(parseAddress(address));
    // eslint-disable-next-line
  }, [address]);

  // Debounce sending up the address, so typing fast doesn't call a parent update each keystroke
  const debouncedAddressChange = useDebouncedCallback((addressObj: AddressComponents) => {
    // Debugging: should only log when you type in an address field
    console.log("[AddressFields] onAddressChange (debounced)", addressObj);
    onAddressChange(addressObj);
  }, 280);

  // Update state and (debounced) notify parent on user field change
  const updateComponent = (field: keyof AddressComponents, value: string) => {
    setComponents((prev) => {
      const updated = { ...prev, [field]: value };
      debouncedAddressChange(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={components.street}
          onChange={(e) => updateComponent("street", e.target.value)}
          placeholder="123 Main Street"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={components.city}
            onChange={(e) => updateComponent("city", e.target.value)}
            placeholder="New York"
          />
        </div>

        <div>
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            value={components.state}
            onChange={(e) => updateComponent("state", e.target.value)}
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
            onChange={(e) => updateComponent("postalCode", e.target.value)}
            placeholder="10001, K1A 0A6, etc."
          />
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Select
            value={components.country}
            onValueChange={(value) => updateComponent("country", value)}
          >
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
