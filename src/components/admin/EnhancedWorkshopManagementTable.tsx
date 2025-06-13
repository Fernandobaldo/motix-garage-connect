
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Eye, 
  Settings, 
  Ban, 
  CheckCircle, 
  Users,
  Calendar,
  Car,
  Shield,
  ShieldOff,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useSuperAdminWorkshops, WorkshopFilters, SuperAdminWorkshopData } from '@/hooks/useSuperAdminWorkshops';
import SuperAdminFilters from './SuperAdminFilters';
import BlockConfirmationModal from './BlockConfirmationModal';
import EditPlanModal from './EditPlanModal';
import ViewUsersModal from './ViewUsersModal';

const EnhancedWorkshopManagementTable = () => {
  const [filters, setFilters] = useState<WorkshopFilters>({
    searchTerm: '',
    planFilter: 'all',
    statusFilter: 'all',
    blockedFilter: 'all',
  });

  const [selectedWorkshop, setSelectedWorkshop] = useState<SuperAdminWorkshopData | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [editPlanModalOpen, setEditPlanModalOpen] = useState(false);
  const [viewUsersModalOpen, setViewUsersModalOpen] = useState(false);
  const [blockAction, setBlockAction] = useState<{ workshop: SuperAdminWorkshopData; isBlocking: boolean } | null>(null);

  const { workshops, isLoading, toggleWorkshopBlock, isToggling, filterWorkshops } = useSuperAdminWorkshops();

  const filteredWorkshops = filterWorkshops(workshops, filters);

  const handleBlockClick = (workshop: SuperAdminWorkshopData, isBlocking: boolean) => {
    setBlockAction({ workshop, isBlocking });
    setBlockModalOpen(true);
  };

  const handleBlockConfirm = (reason?: string) => {
    if (blockAction) {
      toggleWorkshopBlock(blockAction.workshop.tenant_id, blockAction.isBlocking, reason);
      setBlockModalOpen(false);
      setBlockAction(null);
    }
  };

  const getStatusBadge = (status: string, isBlocked: boolean) => {
    if (isBlocked) {
      return <Badge variant="destructive" className="bg-red-600">Blocked</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: 'bg-gray-500',
      starter: 'bg-blue-500',
      pro: 'bg-purple-500',
      enterprise: 'bg-gold-500'
    };
    
    return (
      <Badge className={colors[plan as keyof typeof colors] || 'bg-gray-500'}>
        {plan.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SuperAdminFilters filters={filters} onFiltersChange={setFilters} />
        <Card>
          <CardHeader>
            <CardTitle>SuperAdmin Workshop Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SuperAdminFilters filters={filters} onFiltersChange={setFilters} />
      
      <Card>
        <CardHeader>
          <CardTitle>SuperAdmin Workshop Management</CardTitle>
          <CardDescription>
            Manage all registered workshops with advanced controls and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workshop Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkshops.map((workshop) => (
                  <TableRow key={workshop.tenant_id} className={workshop.tenant_is_blocked ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{workshop.tenant_name}</div>
                        {workshop.workshop_name && workshop.workshop_name !== workshop.tenant_name && (
                          <div className="text-sm text-muted-foreground">
                            Shop: {workshop.workshop_name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {workshop.workshop_email && (
                          <div>{workshop.workshop_email}</div>
                        )}
                        {workshop.workshop_phone && (
                          <div className="text-muted-foreground">{workshop.workshop_phone}</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>{getPlanBadge(workshop.tenant_plan)}</TableCell>
                    
                    <TableCell>{getStatusBadge(workshop.tenant_status, workshop.tenant_is_blocked)}</TableCell>
                    
                    <TableCell>{format(new Date(workshop.tenant_created_at), 'MMM dd, yyyy')}</TableCell>
                    
                    <TableCell>
                      {workshop.owner_last_login_at ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {format(new Date(workshop.owner_last_login_at), 'MMM dd, HH:mm')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{workshop.user_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{workshop.appointment_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Car className="h-3 w-3" />
                          <span>{workshop.vehicle_count}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWorkshop(workshop);
                            setViewUsersModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWorkshop(workshop);
                            setEditPlanModalOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={workshop.tenant_is_blocked ? 'default' : 'destructive'}
                          size="sm"
                          onClick={() => handleBlockClick(workshop, !workshop.tenant_is_blocked)}
                          disabled={isToggling}
                        >
                          {workshop.tenant_is_blocked ? (
                            <Shield className="h-4 w-4" />
                          ) : (
                            <ShieldOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredWorkshops.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No workshops found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {blockAction && (
        <BlockConfirmationModal
          isOpen={blockModalOpen}
          onClose={() => {
            setBlockModalOpen(false);
            setBlockAction(null);
          }}
          onConfirm={handleBlockConfirm}
          workshopName={blockAction.workshop.tenant_name}
          isBlocking={blockAction.isBlocking}
          isLoading={isToggling}
        />
      )}

      {selectedWorkshop && (
        <>
          <EditPlanModal
            workshop={selectedWorkshop}
            open={editPlanModalOpen}
            onOpenChange={setEditPlanModalOpen}
          />
          <ViewUsersModal
            workshop={selectedWorkshop}
            open={viewUsersModalOpen}
            onOpenChange={setViewUsersModalOpen}
          />
        </>
      )}
    </div>
  );
};

export default EnhancedWorkshopManagementTable;
