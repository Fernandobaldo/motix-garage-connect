
import { z } from 'zod';

export const appointmentBookingSchema = z.object({
  workshopId: z.string().min(1, 'Please select a workshop'),
  serviceType: z.string().min(1, 'Please select a service type'),
  vehicleId: z.string().min(1, 'Please select a vehicle'),
  selectedDate: z.date({
    required_error: 'Please select a date',
    invalid_type_error: 'Please select a valid date',
  }),
  selectedTime: z.string().min(1, 'Please select a time'),
  description: z.string().optional(),
});

export const vehicleRegistrationSchema = z.object({
  make: z.string().min(1, 'Make is required').max(50, 'Make must be less than 50 characters'),
  model: z.string().min(1, 'Model is required').max(50, 'Model must be less than 50 characters'),
  year: z.number()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  license_plate: z.string()
    .min(1, 'License plate is required')
    .max(20, 'License plate must be less than 20 characters')
    .regex(/^[A-Z0-9\s-]+$/i, 'License plate can only contain letters, numbers, spaces, and hyphens'),
  fuel_type: z.string().min(1, 'Fuel type is required'),
  transmission: z.string().min(1, 'Transmission type is required'),
});

export const manualAppointmentSchema = z.object({
  clientId: z.string().min(1, 'Please select a client').optional(),
  vehicleId: z.string().min(1, 'Please select a vehicle').optional(),
  serviceType: z.string().min(1, 'Service type is required'),
  selectedDate: z.date({
    required_error: 'Please select a date',
    invalid_type_error: 'Please select a valid date',
  }),
  selectedTime: z.string().min(1, 'Please select a time'),
  description: z.string().optional(),
  // For new clients (guest appointments)
  newClient: z.object({
    full_name: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
    phone: z.string()
      .min(1, 'Phone number is required')
      .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
    email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  }).optional(),
  // For new vehicles
  newVehicle: z.object({
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
    license_plate: z.string().min(1, 'License plate is required'),
    fuel_type: z.string().min(1, 'Fuel type is required'),
    transmission: z.string().min(1, 'Transmission is required'),
  }).optional(),
});

export type AppointmentBookingFormData = z.infer<typeof appointmentBookingSchema>;
export type VehicleRegistrationFormData = z.infer<typeof vehicleRegistrationSchema>;
export type ManualAppointmentFormData = z.infer<typeof manualAppointmentSchema>;
