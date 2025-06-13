
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Car, Calendar, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useClientAssociation } from '@/hooks/useClientAssociation';

const ClientAssociationManager = () => {
  const { 
    associationStats, 
    associationIssues, 
    statsLoading, 
    hasIssues, 
    repairAssociations,
    isRepairing 
  } = useClientAssociation();

  if (statsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Associations</CardTitle>
          <CardDescription>Loading association data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Association Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Client Associations</span>
          </CardTitle>
          <CardDescription>
            Automatic client and vehicle associations through appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {associationStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {associationStats.authenticated_clients}
                </div>
                <div className="text-sm text-blue-800">Account Clients</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {associationStats.guest_clients}
                </div>
                <div className="text-sm text-green-800">Guest Clients</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {associationStats.vehicles}
                </div>
                <div className="text-sm text-purple-800">Vehicles</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {associationStats.appointments}
                </div>
                <div className="text-sm text-orange-800">Appointments</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Association Health Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {hasIssues ? (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <span>Association Health</span>
          </CardTitle>
          <CardDescription>
            Monitor and maintain data consistency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasIssues ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Found {associationIssues?.length} association issues that may need attention.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All client and vehicle associations are properly configured.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => repairAssociations()}
              disabled={isRepairing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRepairing ? 'animate-spin' : ''}`} />
              {isRepairing ? 'Verifying...' : 'Verify Associations'}
            </Button>
            
            {hasIssues && (
              <Badge variant="destructive">
                {associationIssues?.length} Issues Found
              </Badge>
            )}
          </div>

          {/* Show association issues if any */}
          {associationIssues && associationIssues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Association Issues:</h4>
              <div className="space-y-1">
                {associationIssues.map((issue, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    Appointment {issue.appointment_id.slice(0, 8)}...: {issue.association_status}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAssociationManager;
