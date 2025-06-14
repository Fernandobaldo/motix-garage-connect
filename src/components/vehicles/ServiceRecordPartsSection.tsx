
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export interface PartUsed {
  name: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  finalPrice: number; // Calculated: quantity * unitPrice + tax
}

interface ServiceRecordPartsSectionProps {
  parts: PartUsed[];
  setParts: (parts: PartUsed[]) => void;
}

const calculateFinalPrice = (quantity: number, unitPrice: number, tax: number) =>
  parseFloat(((quantity * unitPrice) + tax).toFixed(2));

const ServiceRecordPartsSection: React.FC<ServiceRecordPartsSectionProps> = ({ parts, setParts }) => {
  const addPart = () => {
    setParts([...parts, { name: "", quantity: 1, unitPrice: 0, tax: 0, finalPrice: 0 }]);
  };

  const removePart = (idx: number) => {
    setParts(parts.filter((_, i) => i !== idx));
  };

  const updatePart = (idx: number, field: keyof PartUsed, value: string | number) => {
    const updated = [...parts];
    // Coerce fields appropriately
    if (field === "quantity" || field === "unitPrice" || field === "tax") {
      const quantity = field === "quantity" ? Number(value) : updated[idx].quantity;
      const unitPrice = field === "unitPrice" ? Number(value) : updated[idx].unitPrice;
      const tax = field === "tax" ? Number(value) : updated[idx].tax;
      updated[idx] = {
        ...updated[idx],
        [field]: value,
        finalPrice: calculateFinalPrice(quantity, unitPrice, tax),
      };
    } else {
      updated[idx] = {
        ...updated[idx],
        [field]: value,
        finalPrice: calculateFinalPrice(updated[idx].quantity, updated[idx].unitPrice, updated[idx].tax),
      };
    }
    setParts(updated);
  };

  const totalCost = parts.reduce((sum, p) => sum + Number(p.finalPrice || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Parts Used</Label>
        <Button type="button" onClick={addPart} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" /> Add Part
        </Button>
      </div>
      <div className="space-y-2">
        {parts.map((part, idx) => (
          <div
            key={idx}
            className="grid grid-cols-5 gap-2 items-end md:grid-cols-6"
          >
            <Input
              placeholder="Item Name"
              value={part.name}
              onChange={e => updatePart(idx, "name", e.target.value)}
            />
            <Input
              type="number"
              min={1}
              step={1}
              placeholder="Qty"
              value={part.quantity}
              onChange={e => updatePart(idx, "quantity", Math.max(1, Number(e.target.value)))}
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="Tax"
              value={part.tax}
              onChange={e => updatePart(idx, "tax", Number(e.target.value) || 0)}
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="Unit Price"
              value={part.unitPrice}
              onChange={e => updatePart(idx, "unitPrice", Number(e.target.value) || 0)}
            />
            <Input
              type="number"
              readOnly
              tabIndex={-1}
              value={part.finalPrice}
              className="bg-gray-50"
              placeholder="Final Price"
            />
            {parts.length > 1 && (
              <Button
                onClick={() => removePart(idx)}
                type="button"
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {parts.length > 0 && (
          <div className="flex justify-end pr-2 pt-2 text-right font-medium text-primary">
            Total Parts Cost:&nbsp;
            <span>
              {totalCost.toLocaleString(undefined,{ minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRecordPartsSection;
