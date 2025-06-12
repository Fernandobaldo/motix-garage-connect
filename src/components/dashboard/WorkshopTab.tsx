
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkshopManager from "@/components/workshop/WorkshopManager";
import BrandingManager from "@/components/workshop/BrandingManager";
import PublicLinkManager from "@/components/workshop/PublicLinkManager";

const WorkshopTab = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Workshop Profile</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="booking">Public Booking</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-6">
          <WorkshopManager />
        </TabsContent>
        <TabsContent value="branding" className="space-y-6">
          <BrandingManager />
        </TabsContent>
        <TabsContent value="booking" className="space-y-6">
          <PublicLinkManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkshopTab;
