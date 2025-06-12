
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface WorkshopData {
  id: string;
  name: string;
}

interface UserData {
  id: string;
  full_name: string;
  phone: string | null;
  role: string;
  created_at: string;
}

interface ViewUsersModalProps {
  workshop: WorkshopData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewUsersModal = ({ workshop, open, onOpenChange }: ViewUsersModalProps) => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['workshop-users', workshop.id],
    queryFn: async (): Promise<UserData[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, created_at')
        .eq('tenant_id', workshop.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const getRoleBadge = (role: string) => {
    const colors = {
      workshop: 'bg-blue-500',
      client: 'bg-green-500',
      admin: 'bg-purple-500',
      superadmin: 'bg-red-500',
    };

    return (
      <Badge className={colors[role as keyof typeof colors] || 'bg-gray-500'}>
        {role.toUpperCase()}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Users - {workshop.name}</DialogTitle>
          <DialogDescription>
            All users associated with this workshop
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users && users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{user.full_name}</h4>
                    {getRoleBadge(user.role)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {user.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found for this workshop</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUsersModal;
