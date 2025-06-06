
export interface Appointment {
  id: string;
  service_type: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  client: {
    full_name: string;
  } | null;
  vehicle: {
    make: string;
    model: string;
    year: number;
  } | null;
}

export interface AppointmentListItem extends Appointment {
  description: string;
  client: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
  workshop: {
    id: string;
    name: string;
  } | null;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  } | null;
}

// Additional type for database appointments
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
    full_name: string;
    phone?: string;
  } | null;
  workshop: {
    name: string;
    phone?: string;
  } | null;
  vehicle: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  } | null;
}
