
export interface ServiceHistoryRecord {
  id: string;
  vehicle_id: string;
  workshop_id: string;
  appointment_id?: string;
  quotation_id?: string;
  tenant_id: string;
  service_type: string;
  description?: string;
  completed_at: string;
  cost?: number;
  mileage?: number;
  labor_hours?: number;
  parts_used?: Array<{
    name: string;
    part_number?: string;
    quantity: number;
    cost: number;
  }>;
  technician_notes?: string;
  images?: string[];
  next_service_due_at?: string;
  warranty_until?: string;
  created_at: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  workshop?: {
    name: string;
  };
}

export interface MaintenanceSchedule {
  id: string;
  vehicle_id: string;
  tenant_id: string;
  service_type: string;
  interval_type: 'mileage' | 'time' | 'both';
  interval_value: number;
  mileage_interval?: number;
  last_service_mileage?: number;
  last_service_date?: string;
  next_due_mileage?: number;
  next_due_date?: string;
  is_overdue: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_cost?: number;
  description?: string;
  created_at: string;
  updated_at: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

export interface VehicleHealthReport {
  id: string;
  vehicle_id: string;
  tenant_id: string;
  report_date: string;
  overall_health_score?: number;
  engine_condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  transmission_condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  brake_condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  suspension_condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  electrical_condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  current_mileage?: number;
  fuel_efficiency?: number;
  issues_found?: Array<{
    component: string;
    severity: string;
    description: string;
  }>;
  recommendations?: Array<{
    service: string;
    priority: string;
    estimated_cost?: number;
  }>;
  inspector_notes?: string;
  created_by?: string;
  created_at: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}
