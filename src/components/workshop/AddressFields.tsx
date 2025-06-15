
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "ZA", name: "South Africa" },
  { code: "EG", name: "Egypt" },
  { code: "MA", name: "Morocco" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
];

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

const AddressFields = ({ address, onAddressChange }: AddressFieldsProps) => {
  const [components, setComponents] = useState<AddressComponents>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  // Load and normalize address
  useEffect(() => {
    setComponents(parseAddress(address));
  }, [address]);

  // Pass updated structured address object up
  useEffect(() => {
    onAddressChange({ ...components });
    // eslint-disable-next-line
  }, [components]);

  const updateComponent = (field: keyof AddressComponents, value: string) => {
    setComponents((prev) => ({ ...prev, [field]: value }));
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

