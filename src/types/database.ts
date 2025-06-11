
import { Tables } from '@/integrations/supabase/types';

// Base database types
export type Profile = Tables<'profiles'>;
export type Vehicle = Tables<'vehicles'>;
export type Workshop = Tables<'workshops'>;
export type Quotation = Tables<'quotations'>;
export type QuotationItem = Tables<'quotation_items'>;
export type ServiceHistory = Tables<'service_history'>;
export type ChatConversation = Tables<'chat_conversations'>;
export type ChatMessage = Tables<'chat_messages'>;
export type ChatParticipant = Tables<'chat_participants'>;

// Extended types with relations
export interface AppointmentWithRelations extends Tables<'appointments'> {
  client?: Profile | null;
  workshop?: Workshop | null;
  vehicle?: Vehicle | null;
}

export interface QuotationWithRelations extends Quotation {
  items?: QuotationItem[];
  client?: Profile | null;
  vehicle?: Vehicle | null;
  workshop?: Workshop | null;
}

export interface ChatConversationWithParticipants extends ChatConversation {
  chat_participants?: Array<{
    user_id: string;
    profiles: Profile;
  }>;
}

export interface ChatMessageWithSender extends ChatMessage {
  profiles?: Profile | null;
  sender?: Profile | null;
}

// Form data types
export interface ServiceReportFormData {
  description: string;
  laborHours: number;
  mileage: string;
  cost: number;
  nextServiceDue: string;
  serviceType: string;
}

export interface PartUsed {
  name: string;
  quantity: number;
  price: number;
}

// Component prop types
export interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  onEdit: (appointment: AppointmentWithRelations) => void;
  onDelete: (appointmentId: string) => void;
  onServiceReport: (appointmentId: string) => void;
  onChatClick: (appointment: AppointmentWithRelations) => void;
  onStatusUpdate: (newStatus: string) => void;
  isHistoryView?: boolean;
}

export interface ServiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  onSuccess: () => void;
}

export interface ChatInterfaceProps {
  appointmentId?: string | null;
}
