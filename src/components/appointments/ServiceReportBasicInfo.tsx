
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ServiceReportBasicInfoProps {
  formData: {
    description: string;
    laborHours: number;
    mileage: string;
    cost: number;
    nextServiceDue: string;
  };
  onFormDataChange: (data: any) => void;
}

const ServiceReportBasicInfo = ({ formData, onFormDataChange }: ServiceReportBasicInfoProps) => {
  const updateFormData = (field: string, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <>
      <div>
        <Label>Service Description *</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Describe the service performed..."
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Labor Hours</Label>
          <Input
            type="number"
            step="0.5"
            value={formData.laborHours}
            onChange={(e) => updateFormData('laborHours', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
        <div>
          <Label>Current Mileage</Label>
          <Input
            type="number"
            value={formData.mileage}
            onChange={(e) => updateFormData('mileage', e.target.value)}
            placeholder="Enter current mileage"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Total Cost</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => updateFormData('cost', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label>Next Service Due Date</Label>
          <Input
            type="date"
            value={formData.nextServiceDue}
            onChange={(e) => updateFormData('nextServiceDue', e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default ServiceReportBasicInfo;
