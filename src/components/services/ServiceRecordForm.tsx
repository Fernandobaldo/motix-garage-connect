
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ServiceReportPartsSection from "@/components/appointments/ServiceReportPartsSection";
import type { PartUsed } from "@/types/database";
import { ServiceRecordFormState } from "./useServiceRecordForm";

interface ServiceRecordFormProps {
  form: ServiceRecordFormState;
  setField: (name: keyof ServiceRecordFormState, value: any) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const ServiceRecordForm = ({
  form,
  setField,
  loading,
  onSubmit,
}: ServiceRecordFormProps) => {
  // Handles parts logic just like "add service" flow
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="service_type">Service Type *</Label>
          <Input
            id="service_type"
            required
            value={form.serviceType}
            onChange={(e) => setField("serviceType", e.target.value)}
            placeholder="e.g., Oil Change"
          />
        </div>
        <div>
          <Label htmlFor="cost">Cost</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.cost}
            onChange={(e) => setField("cost", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="Describe the service performed..."
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mileage">Current Mileage</Label>
          <Input
            id="mileage"
            type="number"
            min="0"
            placeholder="e.g., 50000"
            value={form.mileage}
            onChange={(e) => setField("mileage", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="labor_hours">Labor Hours</Label>
          <Input
            id="labor_hours"
            type="number"
            step="0.5"
            min="0"
            placeholder="e.g., 2.5"
            value={form.laborHours}
            onChange={(e) => setField("laborHours", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="technician_notes">Technician Notes</Label>
        <Textarea
          id="technician_notes"
          placeholder="Internal notes, observations, recommendations..."
          value={form.technicianNotes}
          onChange={(e) => setField("technicianNotes", e.target.value)}
          rows={2}
        />
      </div>
      <ServiceReportPartsSection
        partsUsed={form.partsUsed}
        onPartsChange={(p: PartUsed[]) => setField("partsUsed", p)}
      />
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" type="reset" disabled={loading}>
          Reset
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default ServiceRecordForm;

