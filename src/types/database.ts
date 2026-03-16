export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          address_line_1: string | null;
          address_line_2: string | null;
          city: string | null;
          postcode: string | null;
          stripe_customer_id: string | null;
          subscription_tier: "free" | "basic" | "pro";
          subscription_status: "active" | "cancelled" | "past_due" | "trialing";
          subscription_id: string | null;
          cases_count: number;
          ai_suggestions_used: number;
          ai_letters_used: number;
          ai_credits_used: number;
          ai_credits_reset_at: string | null;
          is_admin: boolean | null;
          last_export_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          postcode?: string | null;
          stripe_customer_id?: string | null;
          subscription_tier?: "free" | "basic" | "pro";
          subscription_status?: "active" | "cancelled" | "past_due" | "trialing";
          subscription_id?: string | null;
          cases_count?: number;
          ai_suggestions_used?: number;
          ai_letters_used?: number;
          ai_credits_used?: number;
          ai_credits_reset_at?: string | null;
          is_admin?: boolean | null;
          last_export_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          postcode?: string | null;
          stripe_customer_id?: string | null;
          subscription_tier?: "free" | "basic" | "pro";
          subscription_status?: "active" | "cancelled" | "past_due" | "trialing";
          subscription_id?: string | null;
          cases_count?: number;
          ai_suggestions_used?: number;
          ai_letters_used?: number;
          ai_credits_used?: number;
          ai_credits_reset_at?: string | null;
          is_admin?: boolean | null;
          last_export_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      business_enquiries: {
        Row: {
          id: string;
          company_name: string;
          contact_name: string;
          email: string;
          role: string | null;
          message: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_name: string;
          contact_name: string;
          email: string;
          role?: string | null;
          message?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_name?: string;
          contact_name?: string;
          email?: string;
          role?: string | null;
          message?: string | null;
          created_at?: string | null;
        };
      };
      organisations: {
        Row: {
          id: string;
          name: string;
          category:
            | "energy"
            | "water"
            | "broadband_phone"
            | "financial_services"
            | "insurance"
            | "government_hmrc"
            | "government_dwp"
            | "government_council"
            | "nhs"
            | "housing"
            | "retail"
            | "transport"
            | "education"
            | "employment"
            | "other";
          complaint_email: string | null;
          complaint_phone: string | null;
          complaint_address: string | null;
          website: string | null;
          ombudsman_name: string | null;
          ombudsman_url: string | null;
          escalation_wait_weeks: number | null;
          notes: string | null;
          is_verified: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category:
            | "energy"
            | "water"
            | "broadband_phone"
            | "financial_services"
            | "insurance"
            | "government_hmrc"
            | "government_dwp"
            | "government_council"
            | "nhs"
            | "housing"
            | "retail"
            | "transport"
            | "education"
            | "employment"
            | "other";
          complaint_email?: string | null;
          complaint_phone?: string | null;
          complaint_address?: string | null;
          website?: string | null;
          ombudsman_name?: string | null;
          ombudsman_url?: string | null;
          escalation_wait_weeks?: number | null;
          notes?: string | null;
          is_verified?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          category?:
            | "energy"
            | "water"
            | "broadband_phone"
            | "financial_services"
            | "insurance"
            | "government_hmrc"
            | "government_dwp"
            | "government_council"
            | "nhs"
            | "housing"
            | "retail"
            | "transport"
            | "education"
            | "employment"
            | "other";
          complaint_email?: string | null;
          complaint_phone?: string | null;
          complaint_address?: string | null;
          website?: string | null;
          ombudsman_name?: string | null;
          ombudsman_url?: string | null;
          escalation_wait_weeks?: number | null;
          notes?: string | null;
          is_verified?: boolean | null;
          created_at?: string | null;
        };
      };
      cases: {
        Row: {
          id: string;
          user_id: string;
          organisation_id: string | null;
          custom_organisation_name: string | null;
          category: string;
          title: string;
          description: string | null;
          status: "open" | "escalated" | "resolved" | "closed";
          priority: "low" | "medium" | "high" | "urgent";
          reference_number: string | null;
          desired_outcome: string | null;
          amount_in_dispute: number | null;
          escalation_stage:
            | "initial"
            | "formal_complaint"
            | "final_response"
            | "ombudsman"
            | "court";
          escalation_deadline: string | null;
          first_contact_date: string | null;
          last_interaction_date: string | null;
          resolved_date: string | null;
          resolution_summary: string | null;
          compensation_received: number | null;
          interaction_count: number;
          share_token: string | null;
          is_shared: boolean | null;
          response_deadline: string | null;
          response_received: boolean | null;
          response_received_at: string | null;
          inbound_email_alias: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          organisation_id?: string | null;
          custom_organisation_name?: string | null;
          category: string;
          title: string;
          description?: string | null;
          status?: "open" | "escalated" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "urgent";
          reference_number?: string | null;
          desired_outcome?: string | null;
          amount_in_dispute?: number | null;
          escalation_stage?:
            | "initial"
            | "formal_complaint"
            | "final_response"
            | "ombudsman"
            | "court";
          escalation_deadline?: string | null;
          first_contact_date?: string | null;
          last_interaction_date?: string | null;
          resolved_date?: string | null;
          resolution_summary?: string | null;
          compensation_received?: number | null;
          interaction_count?: number;
          share_token?: string | null;
          is_shared?: boolean | null;
          response_deadline?: string | null;
          response_received?: boolean | null;
          response_received_at?: string | null;
          inbound_email_alias?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          organisation_id?: string | null;
          custom_organisation_name?: string | null;
          category?: string;
          title?: string;
          description?: string | null;
          status?: "open" | "escalated" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "urgent";
          reference_number?: string | null;
          desired_outcome?: string | null;
          amount_in_dispute?: number | null;
          escalation_stage?:
            | "initial"
            | "formal_complaint"
            | "final_response"
            | "ombudsman"
            | "court";
          escalation_deadline?: string | null;
          first_contact_date?: string | null;
          last_interaction_date?: string | null;
          resolved_date?: string | null;
          resolution_summary?: string | null;
          compensation_received?: number | null;
          interaction_count?: number;
          share_token?: string | null;
          is_shared?: boolean | null;
          response_deadline?: string | null;
          response_received?: boolean | null;
          response_received_at?: string | null;
          inbound_email_alias?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      interactions: {
        Row: {
          id: string;
          case_id: string;
          user_id: string;
          interaction_date: string;
          channel:
            | "phone"
            | "email"
            | "letter"
            | "webchat"
            | "in_person"
            | "social_media"
            | "app"
            | "other";
          direction: "inbound" | "outbound";
          contact_name: string | null;
          contact_department: string | null;
          contact_role: string | null;
          reference_number: string | null;
          duration_minutes: number | null;
          summary: string;
          promises_made: string | null;
          promise_deadline: string | null;
          promise_fulfilled: boolean | null;
          outcome:
            | "resolved"
            | "escalated"
            | "promised_callback"
            | "promised_action"
            | "no_resolution"
            | "transferred"
            | "disconnected"
            | "letter_sent"
            | "other"
            | null;
          next_steps: string | null;
          mood: "helpful" | "neutral" | "unhelpful" | "hostile" | null;
          ai_summary: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          case_id: string;
          user_id: string;
          interaction_date: string;
          channel:
            | "phone"
            | "email"
            | "letter"
            | "webchat"
            | "in_person"
            | "social_media"
            | "app"
            | "other";
          direction: "inbound" | "outbound";
          contact_name?: string | null;
          contact_department?: string | null;
          contact_role?: string | null;
          reference_number?: string | null;
          duration_minutes?: number | null;
          summary: string;
          promises_made?: string | null;
          promise_deadline?: string | null;
          promise_fulfilled?: boolean | null;
          outcome?:
            | "resolved"
            | "escalated"
            | "promised_callback"
            | "promised_action"
            | "no_resolution"
            | "transferred"
            | "disconnected"
            | "letter_sent"
            | "other"
            | null;
          next_steps?: string | null;
          mood?: "helpful" | "neutral" | "unhelpful" | "hostile" | null;
          ai_summary?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          case_id?: string;
          user_id?: string;
          interaction_date?: string;
          channel?:
            | "phone"
            | "email"
            | "letter"
            | "webchat"
            | "in_person"
            | "social_media"
            | "app"
            | "other";
          direction?: "inbound" | "outbound";
          contact_name?: string | null;
          contact_department?: string | null;
          contact_role?: string | null;
          reference_number?: string | null;
          duration_minutes?: number | null;
          summary?: string;
          promises_made?: string | null;
          promise_deadline?: string | null;
          promise_fulfilled?: boolean | null;
          outcome?:
            | "resolved"
            | "escalated"
            | "promised_callback"
            | "promised_action"
            | "no_resolution"
            | "transferred"
            | "disconnected"
            | "letter_sent"
            | "other"
            | null;
          next_steps?: string | null;
          mood?: "helpful" | "neutral" | "unhelpful" | "hostile" | null;
          ai_summary?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      evidence: {
        Row: {
          id: string;
          case_id: string;
          interaction_id: string | null;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          description: string | null;
          evidence_type:
            | "screenshot"
            | "email"
            | "letter"
            | "photo"
            | "voice_memo"
            | "document"
            | "receipt"
            | "contract"
            | "other"
            | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          case_id: string;
          interaction_id?: string | null;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          description?: string | null;
          evidence_type?:
            | "screenshot"
            | "email"
            | "letter"
            | "photo"
            | "voice_memo"
            | "document"
            | "receipt"
            | "contract"
            | "other"
            | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          case_id?: string;
          interaction_id?: string | null;
          user_id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          storage_path?: string;
          description?: string | null;
          evidence_type?:
            | "screenshot"
            | "email"
            | "letter"
            | "photo"
            | "voice_memo"
            | "document"
            | "receipt"
            | "contract"
            | "other"
            | null;
          created_at?: string | null;
        };
      };
      letters: {
        Row: {
          id: string;
          case_id: string;
          user_id: string;
          letter_type:
            | "initial_complaint"
            | "follow_up"
            | "escalation"
            | "final_response_request"
            | "ombudsman_referral"
            | "subject_access_request"
            | "formal_notice"
            | "custom";
          recipient_name: string | null;
          recipient_address: string | null;
          subject: string;
          body: string;
          ai_generated: boolean | null;
          sent_date: string | null;
          sent_via: "email" | "post" | "not_sent" | null;
          status: "draft" | "sent" | "acknowledged";
          sent_at: string | null;
          sent_to_email: string | null;
          resend_email_id: string | null;
          delivery_status: string | null;
          delivered_at: string | null;
          opened_at: string | null;
          bounced_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          case_id: string;
          user_id: string;
          letter_type:
            | "initial_complaint"
            | "follow_up"
            | "escalation"
            | "final_response_request"
            | "ombudsman_referral"
            | "subject_access_request"
            | "formal_notice"
            | "custom";
          recipient_name?: string | null;
          recipient_address?: string | null;
          subject: string;
          body: string;
          ai_generated?: boolean | null;
          sent_date?: string | null;
          sent_via?: "email" | "post" | "not_sent" | null;
          status?: "draft" | "sent" | "acknowledged";
          sent_at?: string | null;
          sent_to_email?: string | null;
          resend_email_id?: string | null;
          delivery_status?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          bounced_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          case_id?: string;
          user_id?: string;
          letter_type?:
            | "initial_complaint"
            | "follow_up"
            | "escalation"
            | "final_response_request"
            | "ombudsman_referral"
            | "subject_access_request"
            | "formal_notice"
            | "custom";
          recipient_name?: string | null;
          recipient_address?: string | null;
          subject?: string;
          body?: string;
          ai_generated?: boolean | null;
          sent_date?: string | null;
          sent_via?: "email" | "post" | "not_sent" | null;
          status?: "draft" | "sent" | "acknowledged";
          sent_at?: string | null;
          sent_to_email?: string | null;
          resend_email_id?: string | null;
          delivery_status?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          bounced_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      escalation_rules: {
        Row: {
          id: string;
          category: string;
          stage: string;
          stage_order: number;
          title: string;
          description: string;
          action_required: string;
          wait_period_days: number | null;
          deadline_type: "from_complaint" | "from_response" | "absolute" | null;
          regulatory_body: string | null;
          regulatory_url: string | null;
          template_available: boolean | null;
          tips: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          category: string;
          stage: string;
          stage_order: number;
          title: string;
          description: string;
          action_required: string;
          wait_period_days?: number | null;
          deadline_type?: "from_complaint" | "from_response" | "absolute" | null;
          regulatory_body?: string | null;
          regulatory_url?: string | null;
          template_available?: boolean | null;
          tips?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          category?: string;
          stage?: string;
          stage_order?: number;
          title?: string;
          description?: string;
          action_required?: string;
          wait_period_days?: number | null;
          deadline_type?: "from_complaint" | "from_response" | "absolute" | null;
          regulatory_body?: string | null;
          regulatory_url?: string | null;
          template_available?: boolean | null;
          tips?: string | null;
          created_at?: string | null;
        };
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          case_id: string;
          interaction_id: string | null;
          reminder_type:
            | "promise_deadline"
            | "escalation_window"
            | "follow_up"
            | "response_approaching"
            | "response_due"
            | "response_overdue"
            | "notification"
            | "custom";
          title: string;
          description: string | null;
          due_date: string;
          is_sent: boolean | null;
          is_dismissed: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          case_id: string;
          interaction_id?: string | null;
          reminder_type:
            | "promise_deadline"
            | "escalation_window"
            | "follow_up"
            | "response_approaching"
            | "response_due"
            | "response_overdue"
            | "notification"
            | "custom";
          title: string;
          description?: string | null;
          due_date: string;
          is_sent?: boolean | null;
          is_dismissed?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          case_id?: string;
          interaction_id?: string | null;
          reminder_type?:
            | "promise_deadline"
            | "escalation_window"
            | "follow_up"
            | "response_approaching"
            | "response_due"
            | "response_overdue"
            | "notification"
            | "custom";
          title?: string;
          description?: string | null;
          due_date?: string;
          is_sent?: boolean | null;
          is_dismissed?: boolean | null;
          created_at?: string | null;
        };
      };
      exports: {
        Row: {
          id: string;
          case_id: string;
          user_id: string;
          file_name: string;
          storage_path: string;
          export_type: "full_case" | "timeline_only" | "letters_only";
          created_at: string | null;
        };
        Insert: {
          id?: string;
          case_id: string;
          user_id: string;
          file_name: string;
          storage_path: string;
          export_type?: "full_case" | "timeline_only" | "letters_only";
          created_at?: string | null;
        };
        Update: {
          id?: string;
          case_id?: string;
          user_id?: string;
          file_name?: string;
          storage_path?: string;
          export_type?: "full_case" | "timeline_only" | "letters_only";
          created_at?: string | null;
        };
      };
    };
    Views: {
      v_company_stats: {
        Row: {
          organisation_id: string | null;
          organisation_name: string | null;
          category: string | null;
          total_cases: number | null;
          active_cases: number | null;
          resolved_cases: number | null;
          escalated_to_ombudsman: number | null;
          avg_resolution_days: number | null;
          avg_response_days: number | null;
          letters_sent_count: number | null;
          responses_received_count: number | null;
          total_promises: number | null;
          promises_kept: number | null;
          promises_broken: number | null;
          total_interactions: number | null;
          avg_helpfulness_score: number | null;
          pct_phone: number | null;
          pct_email: number | null;
          pct_webchat: number | null;
          pct_letter: number | null;
          total_amount_disputed: number | null;
          avg_amount_disputed: number | null;
          mood_helpful: number | null;
          mood_neutral: number | null;
          mood_unhelpful: number | null;
          mood_hostile: number | null;
          escalation_rate_pct: number | null;
        };
      };
      v_platform_stats: {
        Row: {
          total_users: number | null;
          free_users: number | null;
          basic_users: number | null;
          pro_users: number | null;
          total_cases: number | null;
          active_cases: number | null;
          resolved_cases: number | null;
          total_interactions: number | null;
          total_promises: number | null;
          total_broken_promises: number | null;
          total_letters: number | null;
          total_letters_sent: number | null;
          total_amount_disputed: number | null;
          companies_complained_about: number | null;
          signups_last_30_days: number | null;
          signups_last_7_days: number | null;
          cases_last_7_days: number | null;
          interactions_last_7_days: number | null;
        };
      };
      v_monthly_trends: {
        Row: {
          month: string | null;
          new_cases: number | null;
          active_users: number | null;
          resolved_cases: number | null;
          ombudsman_referrals: number | null;
          total_disputed: number | null;
        };
      };
      v_category_stats: {
        Row: {
          category: string | null;
          total_cases: number | null;
          companies_count: number | null;
          avg_resolution_days: number | null;
          broken_promises: number | null;
          total_promises: number | null;
          escalation_rate_pct: number | null;
          total_disputed: number | null;
        };
      };
      v_company_rankings: {
        Row: {
          organisation_id: string | null;
          name: string | null;
          category: string | null;
          complaint_count: number | null;
          promise_broken_pct: number | null;
          helpfulness_score: number | null;
          escalation_rate_pct: number | null;
          total_disputed: number | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type WithRelationships<T> = {
  [K in keyof T]: T[K] extends {
    Row: infer R;
    Insert: infer I;
    Update: infer U;
  }
    ? {
        Row: R;
        Insert: I;
        Update: U;
        Relationships: [];
      }
    : T[K];
};

export type SupabaseDatabase = {
  public: {
    Tables: WithRelationships<Database["public"]["Tables"]>;
    Views: Database["public"]["Views"];
    Functions: Database["public"]["Functions"];
    Enums: Database["public"]["Enums"];
    CompositeTypes: Database["public"]["CompositeTypes"];
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Case = Database["public"]["Tables"]["cases"]["Row"];
export type Interaction = Database["public"]["Tables"]["interactions"]["Row"];
export type Evidence = Database["public"]["Tables"]["evidence"]["Row"];
export type Letter = Database["public"]["Tables"]["letters"]["Row"];
export type Organisation = Database["public"]["Tables"]["organisations"]["Row"];
export type EscalationRule =
  Database["public"]["Tables"]["escalation_rules"]["Row"];
export type Reminder = Database["public"]["Tables"]["reminders"]["Row"];
export type BusinessEnquiry =
  Database["public"]["Tables"]["business_enquiries"]["Row"];

export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type CaseInsert = Database["public"]["Tables"]["cases"]["Insert"];
export type CaseUpdate = Database["public"]["Tables"]["cases"]["Update"];
export type InteractionInsert =
  Database["public"]["Tables"]["interactions"]["Insert"];
export type InteractionUpdate =
  Database["public"]["Tables"]["interactions"]["Update"];
export type EvidenceInsert = Database["public"]["Tables"]["evidence"]["Insert"];
export type EvidenceUpdate = Database["public"]["Tables"]["evidence"]["Update"];
export type LetterInsert = Database["public"]["Tables"]["letters"]["Insert"];
export type LetterUpdate = Database["public"]["Tables"]["letters"]["Update"];
export type OrganisationInsert =
  Database["public"]["Tables"]["organisations"]["Insert"];
export type OrganisationUpdate =
  Database["public"]["Tables"]["organisations"]["Update"];
export type EscalationRuleInsert =
  Database["public"]["Tables"]["escalation_rules"]["Insert"];
export type EscalationRuleUpdate =
  Database["public"]["Tables"]["escalation_rules"]["Update"];
export type ReminderInsert = Database["public"]["Tables"]["reminders"]["Insert"];
export type ReminderUpdate = Database["public"]["Tables"]["reminders"]["Update"];
export type ExportInsert = Database["public"]["Tables"]["exports"]["Insert"];
export type ExportUpdate = Database["public"]["Tables"]["exports"]["Update"];
export type BusinessEnquiryInsert =
  Database["public"]["Tables"]["business_enquiries"]["Insert"];
export type BusinessEnquiryUpdate =
  Database["public"]["Tables"]["business_enquiries"]["Update"];
