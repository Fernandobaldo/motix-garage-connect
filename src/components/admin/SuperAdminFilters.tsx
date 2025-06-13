
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { WorkshopFilters } from '@/hooks/useSuperAdminWorkshops';

interface SuperAdminFiltersProps {
  filters: WorkshopFilters;
  onFiltersChange: (filters: WorkshopFilters) => void;
}

const SuperAdminFilters = ({ filters, onFiltersChange }: SuperAdminFiltersProps) => {
  const updateFilter = (key: keyof WorkshopFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters & Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search workshops..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.planFilter}
            onValueChange={(value) => updateFilter('planFilter', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.statusFilter}
            onValueChange={(value) => updateFilter('statusFilter', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.blockedFilter}
            onValueChange={(value) => updateFilter('blockedFilter', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Block Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Not Blocked</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuperAdminFilters;
