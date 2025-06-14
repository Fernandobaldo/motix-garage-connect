
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ServicesWithItemsSection from "./ServicesWithItemsSection";
import { ServiceWithItems, ServiceRecordFormState } from "./useServiceRecordForm";
import { formatCurrency } from "@/utils/currency";
import { useWorkshopPreferences } from "@/hooks/useWorkshopPreferences";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface ServiceRecordFormProps {
  form: ServiceRecordFormState;
  setField: (name: keyof ServiceRecordFormState, value: any) => void;
  loading: boolean;
  // No onSubmit! Submission handled at modal/form level
}

const ServiceRecordForm = ({
  form,
  setField,
  loading,
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

  // Get workshop distance unit preference
  const { preferences } = useWorkshopPreferences();
  const isMiles = preferences?.distance_unit === "miles";
  const distanceUnit = isMiles ? "miles" : "km";
  // Check if "Oil Change" is being performed
  const hasOilChange = form.services.some(
    svc => svc.serviceType.value?.toLowerCase().includes("oil") &&
      svc.serviceType.value?.toLowerCase().includes("change")
  );

  // Use correct label for Current and Next Oil Change Mileage
  const currentMileageLabel = isMiles
    ? "Current Miles"
    : "Current Kilometers";
  const nextOilChangeLabel = isMiles
    ? "Next Oil Change Miles"
    : "Next Oil Change Kilometers";

  return (
    <div className="space-y-4">

      {/* Services Section (always first) */}
      <Accordion type="multiple" defaultValue={['services']}>
        <AccordionItem value="services">
          <AccordionTrigger>
            <span className="font-medium">Services</span>
          </AccordionTrigger>
          <AccordionContent>
            <ServicesWithItemsSection
              services={form.services}
              onChange={svcs => setField("services", svcs)}
              disabled={loading}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Mileage Section - Only shown with Oil Change */}
      {hasOilChange && (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
          <div>
            <Label htmlFor="mileage">{currentMileageLabel}</Label>
            <Input
              id="mileage"
              type="number"
              min="0"
              placeholder={`e.g., 50000`}
              value={form.mileage}
              onChange={(e) => setField("mileage", e.target.value)}
              disabled={loading}
            />
          </div>
          {/* Next Oil Change Mileage */}
          <div>
            <Label htmlFor="next_oil_change_mileage">{nextOilChangeLabel}</Label>
            <Input
              id="next_oil_change_mileage"
              type="number"
              min="0"
              placeholder={`e.g., 55000`}
              value={form.nextOilChangeMileage}
              onChange={(e) => setField("nextOilChangeMileage", e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Technician Notes - always last */}
      <Accordion type="multiple" defaultValue={['technotes']}>
        <AccordionItem value="technotes">
          <AccordionTrigger>
            <span className="font-medium">Technician Notes</span>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              id="technician_notes"
              placeholder="Internal notes, observations, recommendations..."
              value={form.technicianNotes}
              onChange={(e) => setField("technicianNotes", e.target.value)}
              rows={2}
              disabled={loading}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Total Cost (readonly) */}
      <div className="flex justify-end pt-2">
        <div className="bg-muted rounded font-medium px-4 py-2">
          Total Cost: {formatCurrency(totalCost)}
        </div>
      </div>
      {/* No action buttons here! Only visible in parent modal */}
    </div>
  );
};

export default ServiceRecordForm;

