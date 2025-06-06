
export interface Notification {
  id: string;
  user_id: string;
  tenant_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  related_id?: string;
  related_type?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}
