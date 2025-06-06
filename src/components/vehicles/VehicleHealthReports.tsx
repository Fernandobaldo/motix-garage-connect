
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { VehicleHealthReport } from './types';
import { format } from 'date-fns';

interface VehicleHealthReportsProps {
  reports: VehicleHealthReport[];
  onViewReport: (report: VehicleHealthReport) => void;
  onCreateReport: () => void;
}

const VehicleHealthReports = ({ reports, onViewReport, onCreateReport }: VehicleHealthReportsProps) => {
  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' };
      case 'good':
        return { variant: 'secondary' as const, icon: CheckCircle, color: 'text-blue-600' };
      case 'fair':
        return { variant: 'outline' as const, icon: AlertCircle, color: 'text-yellow-600' };
      case 'poor':
        return { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-orange-600' };
      case 'critical':
        return { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' };
      default:
        return { variant: 'outline' as const, icon: AlertCircle, color: 'text-gray-600' };
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No health reports found.</p>
          <Button onClick={onCreateReport}>
            Create First Health Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Vehicle Health Reports</h3>
        <Button onClick={onCreateReport}>
          Create New Report
        </Button>
      </div>
      
      {reports.map((report) => (
        <Card key={report.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">
                    Health Report - {format(new Date(report.report_date), 'MMM dd, yyyy')}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {report.vehicle?.year} {report.vehicle?.make} {report.vehicle?.model}
                  </p>
                </div>
              </div>
              {report.overall_health_score && (
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getHealthScoreColor(report.overall_health_score)}`}>
                    {report.overall_health_score}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getHealthScoreText(report.overall_health_score)}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {report.overall_health_score && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Health</span>
                  <span className={getHealthScoreColor(report.overall_health_score)}>
                    {report.overall_health_score}%
                  </span>
                </div>
                <Progress 
                  value={report.overall_health_score} 
                  className="h-2"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {report.engine_condition && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Engine</span>
                  <Badge variant={getConditionBadge(report.engine_condition).variant}>
                    {report.engine_condition}
                  </Badge>
                </div>
              )}
              
              {report.transmission_condition && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Transmission</span>
                  <Badge variant={getConditionBadge(report.transmission_condition).variant}>
                    {report.transmission_condition}
                  </Badge>
                </div>
              )}
              
              {report.brake_condition && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Brakes</span>
                  <Badge variant={getConditionBadge(report.brake_condition).variant}>
                    {report.brake_condition}
                  </Badge>
                </div>
              )}
              
              {report.suspension_condition && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Suspension</span>
                  <Badge variant={getConditionBadge(report.suspension_condition).variant}>
                    {report.suspension_condition}
                  </Badge>
                </div>
              )}
              
              {report.electrical_condition && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Electrical</span>
                  <Badge variant={getConditionBadge(report.electrical_condition).variant}>
                    {report.electrical_condition}
                  </Badge>
                </div>
              )}
              
              {report.current_mileage && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mileage</span>
                  <span className="text-sm font-medium">
                    {report.current_mileage.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            
            {report.issues_found && report.issues_found.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2 text-red-600">Issues Found:</p>
                <div className="space-y-1">
                  {report.issues_found.slice(0, 2).map((issue, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {issue.component}: {issue.description}
                    </div>
                  ))}
                  {report.issues_found.length > 2 && (
                    <div className="text-sm text-muted-foreground">
                      + {report.issues_found.length - 2} more issues
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {report.recommendations && report.recommendations.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2 text-blue-600">Recommendations:</p>
                <div className="space-y-1">
                  {report.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {rec.service} ({rec.priority} priority)
                    </div>
                  ))}
                  {report.recommendations.length > 2 && (
                    <div className="text-sm text-muted-foreground">
                      + {report.recommendations.length - 2} more recommendations
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(report.report_date), 'MMM dd, yyyy')}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewReport(report)}
              >
                View Full Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VehicleHealthReports;
