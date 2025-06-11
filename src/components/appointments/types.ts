
import type { AppointmentWithRelations } from "@/types/database";

// Re-export the main appointment type
export type { AppointmentWithRelations as Appointment };

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
  client: {
    id: string;
    full_name: string;
    phone: string;
    created_at: string;
    updated_at: string;
    tenant_id: string;
    role: 'client' | 'workshop' | 'admin';
  } | null;
  workshop: {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    created_at: string;
    updated_at: string;
    tenant_id: string;
    owner_id: string;
    is_public: boolean;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    working_hours: any;
    services_offered: string[];
    languages_spoken: string[];
  } | null;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
    fuel_type: string;
    transmission: string;
    owner_id: string;
    tenant_id: string;
    created_at: string;
    updated_at: string;
  } | null;
}
