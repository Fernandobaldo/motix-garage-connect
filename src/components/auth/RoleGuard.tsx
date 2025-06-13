
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: ('client' | 'workshop' | 'admin' | 'superadmin')[];
  children: ReactNode;
  fallback?: ReactNode;
}

const RoleGuard = ({ allowedRoles, children, fallback }: RoleGuardProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-600">Please sign in to access this feature.</p>
        </CardContent>
      </Card>
    );
  }

  if (!allowedRoles.includes(profile.role as 'client' | 'workshop' | 'admin' | 'superadmin')) {
    return (
      fallback || (
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-600">You don't have permission to access this feature.</p>
            <p className="text-sm text-gray-500 mt-1">
              Required role: {allowedRoles.join(' or ')} | Your role: {profile.role}
            </p>
          </CardContent>
        </Card>
      )
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
