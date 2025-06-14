
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import React from "react";

// List of service types
const SERVICE_OPTIONS = [
  "Oil Change",
  "Brake Service",
  "Tire Rotation",
  "General Maintenance",
  "Repair",
  "Inspection",
  "Transmission Service",
  "Engine Service",
  "Electrical Service",
  "Air Conditioning",
  "Other"
];

interface ServiceItemsSectionProps {
  serviceTypes: { value: string; custom?: string }[];
  onChange: (items: { value: string; custom?: string }[]) => void;
  disabled?: boolean;
}

const ServiceItemsSection = ({ serviceTypes, onChange, disabled }: ServiceItemsSectionProps) => {
  const handleAdd = () => onChange([...serviceTypes, { value: "" }]);
  const handleRemove = (i: number) => onChange(serviceTypes.filter((_, idx) => idx !== i));
  const handleChange = (i: number, value: string) => {
    const updated = [...serviceTypes];
    updated[i] = { value, custom: value === "Other" ? updated[i].custom ?? "" : undefined };
    onChange(updated);
  };
  const handleCustomChange = (i: number, custom: string) => {
    const updated = [...serviceTypes];
    updated[i] = { ...updated[i], custom };
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Label>Service Type(s) *</Label>
        <Button type="button" onClick={handleAdd} size="sm" variant="outline" disabled={disabled}>
          <Plus className="h-4 w-4 mr-1" />
          Add Service Type
        </Button>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 mb-2 items-center font-semibold text-sm">
          <div className="col-span-6">Service Type</div>
          <div className="col-span-4">Custom (if "Other")</div>
          <div className="col-span-2"></div>
        </div>
        {serviceTypes.map((item, i) => (
          <div className="grid grid-cols-12 gap-2 items-center" key={i}>
            <div className="col-span-6">
              <Select
                value={item.value}
                onValueChange={(value) => handleChange(i, value)}
                required
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_OPTIONS.map(opt => (
                    <SelectItem value={opt} key={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-4">
              {item.value === "Other" && (
                <input
                  type="text"
                  className="input border border-gray-300 px-2 py-1 rounded w-full"
                  placeholder="Custom service"
                  required
                  value={item.custom ?? ""}
                  onChange={e => handleCustomChange(i, e.target.value)}
                  disabled={disabled}
                />
              )}
            </div>
            <div className="col-span-2 flex">
              {serviceTypes.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemove(i)}
                  disabled={disabled}
                  aria-label="Remove service type"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceItemsSection;
