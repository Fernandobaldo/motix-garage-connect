
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useServiceRecords } from "@/hooks/useServiceRecords";
import type { ServiceRecordWithRelations } from "@/types/database";

interface Props {
  isOpen: boolean;
  service?: ServiceRecordWithRelations;
  onClose: () => void;
  onSuccess?: () => void;
}

const ServiceRecordEditModal = ({ isOpen, service, onClose, onSuccess }: Props) => {
  const { updateServiceRecord, isUpdatePending } = useServiceRecords();

  const [form, setForm] = useState({
    service_type: "",
    description: "",
    cost: "",
    mileage: "",
    labor_hours: "",
    technician_notes: "",
    parts_used: "",
  });

  useEffect(() => {
    if (service && isOpen) {
      setForm({
        service_type: service.service_type || "",
        description: service.description || "",
        cost: service.cost?.toString() || "",
        mileage: service.mileage?.toString() || "",
        labor_hours: service.labor_hours?.toString() || "",
        technician_notes: service.technician_notes || "",
        parts_used: Array.isArray(service.parts_used)
          ? service.parts_used.map((p: any) => p.name).join(", ")
          : "",
      });
    }
  }, [service, isOpen]);

  if (!service) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateServiceRecord({
      id: service.id,
      updates: {
        service_type: form.service_type,
        description: form.description,
        cost: form.cost ? parseFloat(form.cost) : null,
        mileage: form.mileage ? parseInt(form.mileage) : null,
        labor_hours: form.labor_hours ? parseFloat(form.labor_hours) : null,
        technician_notes: form.technician_notes,
        parts_used: form.parts_used
          ? form.parts_used.split(",").map((p) => ({ name: p.trim() }))
          : [],
      },
    });
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Service Record</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Label htmlFor="service_type">Service Type</Label>
          <Input name="service_type" value={form.service_type} onChange={handleChange} required />

          <Label htmlFor="description">Description</Label>
          <Textarea name="description" rows={2} value={form.description} onChange={handleChange} />

          <Label htmlFor="cost">Cost</Label>
          <Input name="cost" type="number" value={form.cost} onChange={handleChange} />

          <Label htmlFor="mileage">Mileage</Label>
          <Input name="mileage" type="number" value={form.mileage} onChange={handleChange} />

          <Label htmlFor="labor_hours">Labor Hours</Label>
          <Input name="labor_hours" type="number" step="0.5" value={form.labor_hours} onChange={handleChange} />

          <Label htmlFor="technician_notes">Technician Notes</Label>
          <Textarea name="technician_notes" rows={2} value={form.technician_notes} onChange={handleChange} />

          <Label htmlFor="parts_used">Parts Used</Label>
          <Input name="parts_used" value={form.parts_used} onChange={handleChange} placeholder="Comma separated" />

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isUpdatePending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdatePending}>
              {isUpdatePending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRecordEditModal;
