
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import React from "react";
import type { ServiceWithItems, PartUsed } from "@/types/database";

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

interface ServicesWithItemsSectionProps {
  services: ServiceWithItems[];
  onChange: (svcs: ServiceWithItems[]) => void;
  disabled?: boolean;
}

const ServicesWithItemsSection = ({
  services,
  onChange,
  disabled,
}: ServicesWithItemsSectionProps) => {
  // Add service
  const addService = () =>
    onChange([
      ...services,
      { serviceType: { value: "" }, items: [{ name: "", quantity: 1, price: 0 }] }
    ]);

  // Remove service
  const removeService = (i: number) => {
    onChange(services.filter((_, idx) => idx !== i));
  };

  // Update service type
  const handleServiceTypeChange = (i: number, value: string) => {
    const updated = [...services];
    updated[i].serviceType = { value, custom: value === "Other" ? updated[i].serviceType.custom ?? "" : undefined };
    onChange(updated);
  };

  // Custom service name
  const handleCustomChange = (i: number, custom: string) => {
    const updated = [...services];
    updated[i].serviceType = { ...updated[i].serviceType, custom };
    onChange(updated);
  };

  // Add item to a service
  const addItem = (svcIdx: number) => {
    const updated = [...services];
    updated[svcIdx].items = [...updated[svcIdx].items, { name: "", quantity: 1, price: 0 }];
    onChange(updated);
  };

  // Remove item from a service
  const removeItem = (svcIdx: number, itemIdx: number) => {
    const updated = [...services];
    updated[svcIdx].items = updated[svcIdx].items.filter((_, idx) => idx !== itemIdx);
    onChange(updated);
  };

  // Update item fields
  const updateItem = (
    svcIdx: number,
    itemIdx: number,
    field: keyof PartUsed,
    value: string | number
  ) => {
    const updated = [...services];
    updated[svcIdx].items[itemIdx] = {
      ...updated[svcIdx].items[itemIdx],
      [field]: value,
    };
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Label>Services *</Label>
        <Button type="button" onClick={addService} size="sm" variant="outline" disabled={disabled}>
          <Plus className="h-4 w-4 mr-1" />
          Add Service
        </Button>
      </div>
      {services.map((svc, svcIdx) => (
        <div key={svcIdx} className="mb-6 border border-muted rounded-lg p-4 bg-muted/40">
          <div className="flex justify-between items-center mb-3">
            {/* Service Type Select */}
            <div className="w-full md:w-1/2">
              <Label>Service Type</Label>
              <Select
                value={svc.serviceType.value}
                onValueChange={(v) => handleServiceTypeChange(svcIdx, v)}
                required
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_OPTIONS.map((opt) => (
                    <SelectItem value={opt} key={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Custom field if Other */}
            <div className="w-full md:w-1/3 ml-4">
              {svc.serviceType.value === "Other" && (
                <Input
                  type="text"
                  className="input border px-2 py-1 rounded w-full"
                  placeholder="Custom service"
                  required
                  value={svc.serviceType.custom ?? ""}
                  onChange={e => handleCustomChange(svcIdx, e.target.value)}
                  disabled={disabled}
                />
              )}
            </div>
            <div>
              {services.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeService(svcIdx)}
                  disabled={disabled}
                  aria-label="Remove service"
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {/* Items Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Items</Label>
              <Button type="button" onClick={() => addItem(svcIdx)} size="sm" variant="outline" disabled={disabled}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="grid grid-cols-12 gap-2 mb-2 items-center font-semibold text-sm">
              <div className="col-span-6">Part Name *</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2"></div>
            </div>
            <div className="space-y-2">
              {svc.items.map((item, itemIdx) => (
                <div key={itemIdx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <Input
                      placeholder="Part name"
                      value={item.name}
                      required
                      onChange={(e) => updateItem(svcIdx, itemIdx, "name", e.target.value)}
                      className={!item.name ? 'border-red-400' : ''}
                      disabled={disabled}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(svcIdx, itemIdx, "quantity", parseInt(e.target.value) || 1)}
                      disabled={disabled}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => updateItem(svcIdx, itemIdx, "price", parseFloat(e.target.value) || 0)}
                      disabled={disabled}
                    />
                  </div>
                  <div className="col-span-2 flex gap-2">
                    {svc.items.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeItem(svcIdx, itemIdx)}
                        size="sm"
                        variant="outline"
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicesWithItemsSection;
