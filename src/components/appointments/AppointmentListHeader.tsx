
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface AppointmentListHeaderProps {
  filter: 'upcoming' | 'history' | 'all';
  sortBy: string;
  onSortChange: (value: string) => void;
}

const AppointmentListHeader = ({ filter, sortBy, onSortChange }: AppointmentListHeaderProps) => {
  if (filter !== 'history') return null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Sort by:</span>
      </div>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="status">Status</SelectItem>
          <SelectItem value="garage">Garage</SelectItem>
          <SelectItem value="vehicle">Vehicle</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AppointmentListHeader;
