
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SuperAdminWorkshopData } from '@/hooks/useSuperAdminWorkshops';

interface ViewUsersModalProps {
  workshop: SuperAdminWorkshopData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewUsersModal = ({ workshop, open, onOpenChange }: ViewUsersModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Users - {workshop.tenant_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Statistics</h4>
              <p>Total Users: {workshop.user_count}</p>
              <p>Appointments: {workshop.appointment_count}</p>
              <p>Vehicles: {workshop.vehicle_count}</p>
            </div>
            <div>
              <h4 className="font-semibold">Owner Info</h4>
              <p>Email: {workshop.workshop_email}</p>
              <p>Phone: {workshop.workshop_phone}</p>
              {workshop.owner_last_login_at && (
                <p>Last Login: {new Date(workshop.owner_last_login_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUsersModal;
