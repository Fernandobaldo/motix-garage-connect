
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import React from "react";

interface PartUsed {
  name: string;
  quantity: number;
  price: number;
}

interface ItemsSectionProps {
  partsUsed: PartUsed[];
  onPartsChange: (parts: PartUsed[]) => void;
  disableRemoveLast?: boolean;
}

const ItemsSection = ({ partsUsed, onPartsChange, disableRemoveLast = false }: ItemsSectionProps) => {
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
        <Label>Items</Label>
        <Button type="button" onClick={addPart} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>
      {/* Column Labels */}
      <div className="grid grid-cols-12 gap-2 mb-2 items-center font-semibold text-sm">
        <div className="col-span-6">Part Name *</div>
        <div className="col-span-2">Quantity</div>
        <div className="col-span-2">Price</div>
        <div className="col-span-2"></div>
      </div>
      <div className="space-y-3">
        {partsUsed.map((part, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-6">
              <Input
                placeholder="Part name"
                value={part.name}
                required
                onChange={(e) => updatePart(index, 'name', e.target.value)}
                className={!part.name ? 'border-red-400' : ''}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                min={1}
                placeholder="Qty"
                value={part.quantity}
                onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="Price"
                value={part.price}
                onChange={(e) => updatePart(index, 'price', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-2 flex gap-2">
              {partsUsed.length > 1 && (!disableRemoveLast || partsUsed.length > 1) && (
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

export default ItemsSection;
