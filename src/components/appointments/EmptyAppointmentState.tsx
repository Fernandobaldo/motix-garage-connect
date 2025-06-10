
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface EmptyAppointmentStateProps {
  filter: 'upcoming' | 'history' | 'all';
}

const EmptyAppointmentState = ({ filter }: EmptyAppointmentStateProps) => {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          {filter === 'upcoming' ? 'No upcoming appointments' : 'No appointment history'}
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyAppointmentState;
