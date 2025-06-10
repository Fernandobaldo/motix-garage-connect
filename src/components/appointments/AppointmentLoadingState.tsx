
import { Card, CardHeader } from "@/components/ui/card";

const AppointmentLoadingState = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentLoadingState;
