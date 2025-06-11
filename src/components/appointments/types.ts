
import type { AppointmentWithRelations } from "@/types/database";

// Re-export the main appointment type
export type { AppointmentWithRelations as Appointment };

// Simplified types for database queries that don't fetch all fields
export interface AppointmentListItemClient {
  id: string;
  full_name: string;
  phone?: string;
}

export interface AppointmentListItemWorkshop {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface AppointmentListItemVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

// For guest appointments created without actual client records
export interface GuestAppointmentData extends Omit<AppointmentWithRelations, 'client'> {
  client: {
    id: null;
    full_name: string;
    phone: string;
    created_at: string;
    updated_at: string;
    tenant_id: null;
    role: 'client' as const;
  } | null;
}

// Database appointment type for raw queries
export interface DatabaseAppointment {
  id: string;
  client_id: string;
  created_at: string;
  description: string;
  duration_minutes: number;
  scheduled_at: string;
  service_type: string;
  status: string;
  tenant_id: string;
  updated_at: string;
  workshop_id: string;
  vehicle_id: string | null;
  client: AppointmentListItemClient | null;
  workshop: AppointmentListItemWorkshop | null;
  vehicle: AppointmentListItemVehicle | null;
}
