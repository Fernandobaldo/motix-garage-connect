export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          new_values: Json | null
          old_values: Json | null
          target_tenant_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          target_tenant_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          target_tenant_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_target_tenant_id_fkey"
            columns: ["target_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          guest_client_id: string | null
          id: string
          reservation_expires_at: string | null
          reservation_token: string | null
          scheduled_at: string
          service_type: string
          status: string | null
          tenant_id: string
          updated_at: string
          vehicle_id: string | null
          workshop_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          guest_client_id?: string | null
          id?: string
          reservation_expires_at?: string | null
          reservation_token?: string | null
          scheduled_at: string
          service_type: string
          status?: string | null
          tenant_id: string
          updated_at?: string
          vehicle_id?: string | null
          workshop_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          guest_client_id?: string | null
          id?: string
          reservation_expires_at?: string | null
          reservation_token?: string | null
          scheduled_at?: string
          service_type?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
          vehicle_id?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_guest_client_id_fkey"
            columns: ["guest_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_vehicle"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_workshop"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          tenant_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          tenant_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          tenant_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          message_type: string | null
          sender_id: string
          translated_content: Json | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          sender_id: string
          translated_content?: Json | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          sender_id?: string
          translated_content?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_schedules: {
        Row: {
          created_at: string
          description: string | null
          estimated_cost: number | null
          id: string
          interval_type: string
          interval_value: number
          is_overdue: boolean | null
          last_service_date: string | null
          last_service_mileage: number | null
          mileage_interval: number | null
          next_due_date: string | null
          next_due_mileage: number | null
          priority: string | null
          service_type: string
          tenant_id: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          interval_type: string
          interval_value: number
          is_overdue?: boolean | null
          last_service_date?: string | null
          last_service_mileage?: number | null
          mileage_interval?: number | null
          next_due_date?: string | null
          next_due_mileage?: number | null
          priority?: string | null
          service_type: string
          tenant_id: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          interval_type?: string
          interval_value?: number
          is_overdue?: boolean | null
          last_service_date?: string | null
          last_service_mileage?: number | null
          mileage_interval?: number | null
          next_due_date?: string | null
          next_due_mileage?: number | null
          priority?: string | null
          service_type?: string
          tenant_id?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_usage: {
        Row: {
          appointments_count: number
          created_at: string
          id: string
          month: number
          storage_used: number
          tenant_id: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          appointments_count?: number
          created_at?: string
          id?: string
          month: number
          storage_used?: number
          tenant_id: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          appointments_count?: number
          created_at?: string
          id?: string
          month?: number
          storage_used?: number
          tenant_id?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean | null
          email_service: string | null
          id: string
          reminder_24h_enabled: boolean | null
          reminder_2h_enabled: boolean | null
          sms_enabled: boolean | null
          sms_service: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean | null
          email_service?: string | null
          id?: string
          reminder_24h_enabled?: boolean | null
          reminder_2h_enabled?: boolean | null
          sms_enabled?: boolean | null
          sms_service?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean | null
          email_service?: string | null
          id?: string
          reminder_24h_enabled?: boolean | null
          reminder_2h_enabled?: boolean | null
          sms_enabled?: boolean | null
          sms_service?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          tenant_id: string
          trigger_event: string
          type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          tenant_id: string
          trigger_event: string
          type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          tenant_id?: string
          trigger_event?: string
          type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          related_id: string | null
          related_type: string | null
          tenant_id: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          tenant_id: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          tenant_id?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_changes: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_plan: string
          old_plan: string | null
          reason: string | null
          tenant_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          new_plan: string
          old_plan?: string | null
          reason?: string | null
          tenant_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_plan?: string
          old_plan?: string | null
          reason?: string | null
          tenant_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          last_login_at: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          last_login_at?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          last_login_at?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          created_at: string
          description: string
          id: string
          item_type: string | null
          quantity: number
          quotation_id: string
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          item_type?: string | null
          quantity?: number
          quotation_id: string
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          item_type?: string | null
          quantity?: number
          quotation_id?: string
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          appointment_id: string | null
          approved_at: string | null
          client_id: string
          created_at: string
          description: string | null
          id: string
          labor_cost: number | null
          parts_cost: number | null
          quote_number: string
          status: string | null
          tax_rate: number | null
          tenant_id: string
          total_cost: number
          updated_at: string
          valid_until: string | null
          vehicle_id: string | null
          workshop_id: string
        }
        Insert: {
          appointment_id?: string | null
          approved_at?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          labor_cost?: number | null
          parts_cost?: number | null
          quote_number: string
          status?: string | null
          tax_rate?: number | null
          tenant_id: string
          total_cost: number
          updated_at?: string
          valid_until?: string | null
          vehicle_id?: string | null
          workshop_id: string
        }
        Update: {
          appointment_id?: string | null
          approved_at?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          labor_cost?: number | null
          parts_cost?: number | null
          quote_number?: string
          status?: string | null
          tax_rate?: number | null
          tenant_id?: string
          total_cost?: number
          updated_at?: string
          valid_until?: string | null
          vehicle_id?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          service_type: string
          template_items: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          service_type: string
          template_items?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          service_type?: string
          template_items?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_history: {
        Row: {
          appointment_id: string | null
          completed_at: string
          cost: number | null
          created_at: string
          description: string | null
          id: string
          images: Json | null
          labor_hours: number | null
          mileage: number | null
          next_service_due_at: string | null
          parts_used: Json | null
          quotation_id: string | null
          service_type: string
          status: Database["public"]["Enums"]["service_status"] | null
          technician_notes: string | null
          tenant_id: string
          vehicle_id: string
          warranty_until: string | null
          workshop_id: string
        }
        Insert: {
          appointment_id?: string | null
          completed_at?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          labor_hours?: number | null
          mileage?: number | null
          next_service_due_at?: string | null
          parts_used?: Json | null
          quotation_id?: string | null
          service_type: string
          status?: Database["public"]["Enums"]["service_status"] | null
          technician_notes?: string | null
          tenant_id: string
          vehicle_id: string
          warranty_until?: string | null
          workshop_id: string
        }
        Update: {
          appointment_id?: string | null
          completed_at?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          labor_hours?: number | null
          mileage?: number | null
          next_service_due_at?: string | null
          parts_used?: Json | null
          quotation_id?: string | null
          service_type?: string
          status?: Database["public"]["Enums"]["service_status"] | null
          technician_notes?: string | null
          tenant_id?: string
          vehicle_id?: string
          warranty_until?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_history_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_history_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      service_records: {
        Row: {
          appointment_id: string | null
          client_id: string | null
          cost: number | null
          created_at: string
          description: string | null
          estimated_completion_date: string | null
          id: string
          images: Json | null
          labor_hours: number | null
          mileage: number | null
          parts_used: Json | null
          quotation_id: string | null
          service_type: string
          status: Database["public"]["Enums"]["service_status"]
          technician_notes: string | null
          tenant_id: string
          updated_at: string
          vehicle_id: string
          workshop_id: string
        }
        Insert: {
          appointment_id?: string | null
          client_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          estimated_completion_date?: string | null
          id?: string
          images?: Json | null
          labor_hours?: number | null
          mileage?: number | null
          parts_used?: Json | null
          quotation_id?: string | null
          service_type: string
          status?: Database["public"]["Enums"]["service_status"]
          technician_notes?: string | null
          tenant_id: string
          updated_at?: string
          vehicle_id: string
          workshop_id: string
        }
        Update: {
          appointment_id?: string | null
          client_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          estimated_completion_date?: string | null
          id?: string
          images?: Json | null
          labor_hours?: number | null
          mileage?: number | null
          parts_used?: Json | null
          quotation_id?: string | null
          service_type?: string
          status?: Database["public"]["Enums"]["service_status"]
          technician_notes?: string | null
          tenant_id?: string
          updated_at?: string
          vehicle_id?: string
          workshop_id?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          is_blocked: boolean
          name: string
          settings: Json | null
          status: string
          subdomain: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          suspended_at: string | null
          suspended_by: string | null
          trial_until: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_blocked?: boolean
          name: string
          settings?: Json | null
          status?: string
          subdomain?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          suspended_at?: string | null
          suspended_by?: string | null
          trial_until?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_blocked?: boolean
          name?: string
          settings?: Json | null
          status?: string
          subdomain?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          suspended_at?: string | null
          suspended_by?: string | null
          trial_until?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_health_reports: {
        Row: {
          brake_condition: string | null
          created_at: string
          created_by: string | null
          current_mileage: number | null
          electrical_condition: string | null
          engine_condition: string | null
          fuel_efficiency: number | null
          id: string
          inspector_notes: string | null
          issues_found: Json | null
          overall_health_score: number | null
          recommendations: Json | null
          report_date: string
          suspension_condition: string | null
          tenant_id: string
          transmission_condition: string | null
          vehicle_id: string
        }
        Insert: {
          brake_condition?: string | null
          created_at?: string
          created_by?: string | null
          current_mileage?: number | null
          electrical_condition?: string | null
          engine_condition?: string | null
          fuel_efficiency?: number | null
          id?: string
          inspector_notes?: string | null
          issues_found?: Json | null
          overall_health_score?: number | null
          recommendations?: Json | null
          report_date?: string
          suspension_condition?: string | null
          tenant_id: string
          transmission_condition?: string | null
          vehicle_id: string
        }
        Update: {
          brake_condition?: string | null
          created_at?: string
          created_by?: string | null
          current_mileage?: number | null
          electrical_condition?: string | null
          engine_condition?: string | null
          fuel_efficiency?: number | null
          id?: string
          inspector_notes?: string | null
          issues_found?: Json | null
          overall_health_score?: number | null
          recommendations?: Json | null
          report_date?: string
          suspension_condition?: string | null
          tenant_id?: string
          transmission_condition?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_health_reports_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          client_id: string | null
          created_at: string
          fuel_type: string | null
          id: string
          license_plate: string
          make: string
          model: string
          owner_id: string | null
          tenant_id: string | null
          transmission: string | null
          updated_at: string
          year: number
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          fuel_type?: string | null
          id?: string
          license_plate: string
          make: string
          model: string
          owner_id?: string | null
          tenant_id?: string | null
          transmission?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          client_id?: string | null
          created_at?: string
          fuel_type?: string | null
          id?: string
          license_plate?: string
          make?: string
          model?: string
          owner_id?: string | null
          tenant_id?: string | null
          transmission?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_vehicles_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_preferences: {
        Row: {
          created_at: string
          currency_code: string
          distance_unit: string
          id: string
          tenant_id: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code?: string
          distance_unit?: string
          id?: string
          tenant_id: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          distance_unit?: string
          id?: string
          tenant_id?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      workshop_public_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          settings: Json | null
          slug: string
          tenant_id: string
          updated_at: string
          workshop_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          settings?: Json | null
          slug: string
          tenant_id: string
          updated_at?: string
          workshop_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          settings?: Json | null
          slug?: string
          tenant_id?: string
          updated_at?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_public_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_public_links_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          accent_color: string | null
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_public: boolean | null
          languages_spoken: string[] | null
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          services_offered: string[] | null
          tenant_id: string | null
          updated_at: string
          working_hours: Json | null
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_public?: boolean | null
          languages_spoken?: string[] | null
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          services_offered?: string[] | null
          tenant_id?: string | null
          updated_at?: string
          working_hours?: Json | null
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_public?: boolean | null
          languages_spoken?: string[] | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          services_offered?: string[] | null
          tenant_id?: string | null
          updated_at?: string
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "workshops_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshops_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_quotation_total: {
        Args: { quotation_uuid: string }
        Returns: undefined
      }
      can_add_client: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      can_create_appointment: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      check_overdue_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_reservations: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      confirm_reservation: {
        Args: { p_reservation_token: string; p_user_id: string }
        Returns: boolean
      }
      create_default_notification_templates: {
        Args: { workshop_tenant_id: string }
        Returns: undefined
      }
      create_temporary_reservation: {
        Args: {
          p_workshop_id: string
          p_tenant_id: string
          p_scheduled_at: string
          p_service_type: string
          p_client_email: string
          p_client_name: string
          p_client_phone?: string
          p_vehicle_info?: string
          p_notes?: string
        }
        Returns: {
          appointment_id: string
          reservation_token: string
        }[]
      }
      generate_quote_number: {
        Args: { tenant_uuid: string }
        Returns: string
      }
      generate_workshop_public_link: {
        Args: { p_workshop_id: string; p_custom_slug?: string }
        Returns: {
          link_id: string
          slug: string
          public_url: string
        }[]
      }
      get_all_workshops_for_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: {
          tenant_id: string
          tenant_name: string
          tenant_status: string
          tenant_plan: string
          tenant_created_at: string
          tenant_is_blocked: boolean
          workshop_id: string
          workshop_name: string
          workshop_email: string
          workshop_phone: string
          workshop_owner_id: string
          owner_last_login_at: string
          user_count: number
          appointment_count: number
          vehicle_count: number
        }[]
      }
      get_client_limit: {
        Args: { p_tenant_id: string }
        Returns: number
      }
      get_monthly_usage: {
        Args: { p_tenant_id: string; p_user_id?: string }
        Returns: {
          appointments_used: number
          storage_used: number
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never> | { user_uuid: string }
        Returns: string
      }
      get_user_tenant_id: {
        Args: Record<PropertyKey, never> | { user_uuid: string }
        Returns: string
      }
      get_workshop_association_stats: {
        Args: { p_tenant_id: string }
        Returns: Json
      }
      get_workshop_public_data: {
        Args: { workshop_slug: string }
        Returns: {
          workshop_id: string
          workshop_name: string
          workshop_email: string
          workshop_phone: string
          workshop_address: string
          working_hours: Json
          logo_url: string
          primary_color: string
          secondary_color: string
          accent_color: string
          services_offered: string[]
          tenant_id: string
        }[]
      }
      get_workshop_stats: {
        Args: { workshop_tenant_id: string }
        Returns: Json
      }
      increment_monthly_usage: {
        Args: { p_tenant_id: string; p_user_id: string; p_type?: string }
        Returns: undefined
      }
      is_superadmin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_target_tenant_id?: string
          p_target_user_id?: string
          p_old_values?: Json
          p_new_values?: Json
          p_details?: Json
        }
        Returns: string
      }
      manage_workshop_status: {
        Args: { p_tenant_id: string; p_new_status: string; p_reason?: string }
        Returns: undefined
      }
      search_vehicles_by_plate: {
        Args: { p_tenant_id: string; p_search_term: string }
        Returns: {
          vehicle_id: string
          license_plate: string
          make: string
          model: string
          year: number
          client_id: string
          client_name: string
          client_type: string
        }[]
      }
      toggle_workshop_block: {
        Args: { p_tenant_id: string; p_is_blocked: boolean; p_reason?: string }
        Returns: undefined
      }
      update_workshop_plan: {
        Args: {
          p_tenant_id: string
          p_new_plan: string
          p_trial_until?: string
        }
        Returns: undefined
      }
      user_belongs_to_tenant: {
        Args: { check_tenant_id: string }
        Returns: boolean
      }
      verify_client_workshop_associations: {
        Args: Record<PropertyKey, never>
        Returns: {
          appointment_id: string
          client_id: string
          guest_client_id: string
          vehicle_id: string
          workshop_tenant_id: string
          association_status: string
        }[]
      }
    }
    Enums: {
      service_status:
        | "pending"
        | "in_progress"
        | "awaiting_approval"
        | "completed"
        | "cancelled"
      subscription_plan: "free" | "starter" | "pro" | "enterprise"
      user_role: "client" | "workshop" | "admin" | "superadmin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      service_status: [
        "pending",
        "in_progress",
        "awaiting_approval",
        "completed",
        "cancelled",
      ],
      subscription_plan: ["free", "starter", "pro", "enterprise"],
      user_role: ["client", "workshop", "admin", "superadmin"],
    },
  },
} as const
