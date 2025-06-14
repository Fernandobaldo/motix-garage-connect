import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ItemsSection from "@/components/appointments/ServiceReportPartsSection";
import ServicesWithItemsSection from "./ServicesWithItemsSection";
import { ServiceWithItems, ServiceRecordFormState } from "./useServiceRecordForm";
import { formatCurrency } from "@/utils/currency";

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
  // Calculate total cost from all services' items
  const totalCost = form.services.reduce(
    (svcCost, svc) =>
      svcCost +
      svc.items.reduce(
        (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0),
        0
      ),
    0
  );

  // Validation for UI only
  const servicesValid =
    Array.isArray(form.services) &&
    form.services.length > 0 &&
    form.services.every(svc => svc.serviceType.value);
  const itemsValid = form.services.every(svc =>
    svc.items.every(item => !!item.name)
  );

  return (
    <form className="space-y-4" onSubmit={onSubmit} autoComplete="off">
      <ServicesWithItemsSection
        services={form.services}
        onChange={svcs => setField("services", svcs)}
        disabled={loading}
      />
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
        {/* Labor Hours still removed */}
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
      {/* Total Cost (readonly) */}
      <div className="flex justify-end pt-2">
        <div className="bg-muted rounded font-medium px-4 py-2">
          Total Cost: {formatCurrency(totalCost)}
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" type="reset" disabled={loading}>
          Reset
        </Button>
        <Button type="submit" disabled={loading || !servicesValid || !itemsValid}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default ServiceRecordForm;
