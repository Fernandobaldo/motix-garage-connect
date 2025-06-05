
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
