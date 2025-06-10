
import UserProfile from "@/components/profile/UserProfile";
import RoleGuard from "@/components/auth/RoleGuard";
import WorkshopManager from "@/components/workshop/WorkshopManager";
import { Separator } from "@/components/ui/separator";

const UserProfileTab = () => {
  return (
    <div className="space-y-8">
      <UserProfile />
      
      <RoleGuard allowedRoles={['workshop']}>
        <Separator />
        <WorkshopManager />
      </RoleGuard>
    </div>
  );
};

export default UserProfileTab;
