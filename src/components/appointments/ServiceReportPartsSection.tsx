
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface PartUsed {
  name: string;
  quantity: number;
  price: number;
}

interface ServiceReportPartsSectionProps {
  partsUsed: PartUsed[];
  onPartsChange: (parts: PartUsed[]) => void;
}

const ServiceReportPartsSection = ({ partsUsed, onPartsChange }: ServiceReportPartsSectionProps) => {
  const addPart = () => {
    onPartsChange([...partsUsed, { name: '', quantity: 1, price: 0 }]);
  };

  const removePart = (index: number) => {
    onPartsChange(partsUsed.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof PartUsed, value: string | number) => {
    const updated = [...partsUsed];
    updated[index] = { ...updated[index], [field]: value };
    onPartsChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Label>Parts Used</Label>
        <Button type="button" onClick={addPart} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Part
        </Button>
      </div>
      
      <div className="space-y-3">
        {partsUsed.map((part, index) => (
          <div key={index} className="grid grid-cols-4 gap-2 items-end">
            <div className="col-span-2">
              <Input
                placeholder="Part name"
                value={part.name}
                onChange={(e) => updatePart(index, 'name', e.target.value)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Qty"
                value={part.quantity}
                onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                min={1}
              />
            </div>
            <div className="flex gap-1">
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={part.price}
                onChange={(e) => updatePart(index, 'price', parseFloat(e.target.value) || 0)}
              />
              {partsUsed.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removePart(index)}
                  size="sm"
                  variant="outline"
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

export default ServiceReportPartsSection;
