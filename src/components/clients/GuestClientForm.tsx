
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GuestClientData {
  full_name: string;
  phone: string;
  email: string;
}

interface GuestClientFormProps {
  clientData: GuestClientData;
  onClientDataChange: (data: GuestClientData) => void;
}

const GuestClientForm = ({ clientData, onClientDataChange }: GuestClientFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Guest Client Information</CardTitle>
        <CardDescription>
          For clients without an account - information will be stored with the appointment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Full Name *</Label>
            <Input
              value={clientData.full_name}
              onChange={(e) => onClientDataChange({ ...clientData, full_name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <Label>Phone *</Label>
            <Input
              value={clientData.phone}
              onChange={(e) => onClientDataChange({ ...clientData, phone: e.target.value })}
              placeholder="Enter phone number"
              required
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={clientData.email}
              onChange={(e) => onClientDataChange({ ...clientData, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestClientForm;
