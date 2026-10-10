/**
 * Database types for the Global Financial Assets Supabase schema.
 * Kept in the same shape as `supabase gen types typescript` output so it can be
 * regenerated with:
 *   npx supabase gen types typescript --project-id <ref> > src/integrations/supabase/types.ts
 * Source of truth: supabase/migrations/*.sql
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = 'buyer' | 'seller' | 'reviewer' | 'admin';
export type AssetStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected' | 'archived' | 'sold';
export type VerificationLevel = 'unverified' | 'company_checked' | 'regulator_record_checked' | 'documents_reviewed';
export type TransactionType =
  | 'full_acquisition'
  | 'majority_stake'
  | 'minority_stake'
  | 'asset_purchase'
  | 'merger'
  | 'joint_venture';
export type OperatingStatus = 'operating' | 'pre_launch' | 'dormant' | 'licence_pending';
export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'withdrawn';
export type EnquiryStatus = 'new' | 'in_review' | 'responded' | 'closed' | 'spam';
export type MandateStatus = 'active' | 'paused' | 'closed';

type Timestamp = string;

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          short_name: string;
          description: string;
          long_description: string | null;
          icon: string;
          sort_order: number;
          seo_title: string | null;
          seo_description: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          short_name: string;
          description: string;
          long_description?: string | null;
          icon?: string;
          sort_order?: number;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [];
      };
      jurisdictions: {
        Row: {
          id: string;
          slug: string;
          name: string;
          region: string;
          iso_code: string | null;
          description: string;
          regulator_summary: string | null;
          sort_order: number;
          seo_title: string | null;
          seo_description: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          region: string;
          iso_code?: string | null;
          description: string;
          regulator_summary?: string | null;
          sort_order?: number;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Update: Partial<Database['public']['Tables']['jurisdictions']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          company_name: string | null;
          job_title: string | null;
          phone: string | null;
          country: string | null;
          buyer_type: string | null;
          investment_focus: string | null;
          marketing_opt_in: boolean;
          accepted_terms_at: Timestamp | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          company_name?: string | null;
          job_title?: string | null;
          phone?: string | null;
          country?: string | null;
          buyer_type?: string | null;
          investment_focus?: string | null;
          marketing_opt_in?: boolean;
          accepted_terms_at?: Timestamp | null;
        };
        Update: {
          full_name?: string | null;
          company_name?: string | null;
          job_title?: string | null;
          phone?: string | null;
          country?: string | null;
          buyer_type?: string | null;
          investment_focus?: string | null;
          marketing_opt_in?: boolean;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          granted_by: string | null;
          created_at: Timestamp;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      currency_rates: {
        Row: { currency: string; rate_to_eur: number; updated_at: Timestamp };
        Insert: { currency: string; rate_to_eur: number };
        Update: { rate_to_eur?: number };
        Relationships: [];
      };
      assets: {
        Row: {
          id: string;
          reference_code: string;
          slug: string;
          title: string;
          summary: string;
          description: string | null;
          category_id: string;
          jurisdiction_id: string;
          transaction_type: TransactionType;
          operating_status: OperatingStatus;
          asking_price: number | null;
          currency: string;
          price_on_request: boolean;
          asking_price_eur: number | null;
          licence_type: string | null;
          regulator: string | null;
          year_established: number | null;
          team_size: string | null;
          revenue_range: string | null;
          included_assets: string[];
          highlights: string[];
          verification_status: VerificationLevel;
          verified_at: Timestamp | null;
          status: AssetStatus;
          is_demo: boolean;
          is_featured: boolean;
          seller_id: string | null;
          submission_id: string | null;
          approved_by: string | null;
          approved_at: Timestamp | null;
          published_at: Timestamp | null;
          archived_at: Timestamp | null;
          sold_at: Timestamp | null;
          seo_title: string | null;
          seo_description: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          slug?: string;
          title: string;
          summary: string;
          description?: string | null;
          category_id: string;
          jurisdiction_id: string;
          transaction_type: TransactionType;
          operating_status: OperatingStatus;
          asking_price?: number | null;
          currency?: string;
          price_on_request?: boolean;
          licence_type?: string | null;
          regulator?: string | null;
          year_established?: number | null;
          team_size?: string | null;
          revenue_range?: string | null;
          included_assets?: string[];
          highlights?: string[];
          is_featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Update: Partial<Database['public']['Tables']['assets']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'assets_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assets_jurisdiction_id_fkey';
            columns: ['jurisdiction_id'];
            isOneToOne: false;
            referencedRelation: 'jurisdictions';
            referencedColumns: ['id'];
          },
        ];
      };
      asset_private_details: {
        Row: {
          asset_id: string;
          company_legal_name: string | null;
          registration_number: string | null;
          licence_number: string | null;
          registered_address: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          internal_notes: string | null;
          updated_at: Timestamp;
        };
        Insert: {
          asset_id: string;
          company_legal_name?: string | null;
          registration_number?: string | null;
          licence_number?: string | null;
          registered_address?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          internal_notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['asset_private_details']['Insert']>;
        Relationships: [];
      };
      seller_submissions: {
        Row: {
          id: string;
          seller_id: string;
          status: SubmissionStatus;
          title: string;
          category_id: string | null;
          jurisdiction_id: string | null;
          transaction_type: TransactionType | null;
          operating_status: OperatingStatus | null;
          asking_price: number | null;
          currency: string;
          price_on_request: boolean;
          summary: string | null;
          description: string | null;
          licence_type: string | null;
          regulator: string | null;
          year_established: number | null;
          team_size: string | null;
          revenue_range: string | null;
          included_assets: string[];
          highlights: string[];
          company_legal_name: string | null;
          registration_number: string | null;
          licence_number: string | null;
          reason_for_sale: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          seller_declaration: boolean;
          feedback_to_seller: string | null;
          submitted_at: Timestamp | null;
          reviewed_at: Timestamp | null;
          reviewed_by: string | null;
          asset_id: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          seller_id?: string;
          status?: 'draft' | 'submitted';
          title: string;
          category_id?: string | null;
          jurisdiction_id?: string | null;
          transaction_type?: TransactionType | null;
          operating_status?: OperatingStatus | null;
          asking_price?: number | null;
          currency?: string;
          price_on_request?: boolean;
          summary?: string | null;
          description?: string | null;
          licence_type?: string | null;
          regulator?: string | null;
          year_established?: number | null;
          team_size?: string | null;
          revenue_range?: string | null;
          included_assets?: string[];
          highlights?: string[];
          company_legal_name?: string | null;
          registration_number?: string | null;
          licence_number?: string | null;
          reason_for_sale?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          seller_declaration?: boolean;
        };
        Update: Omit<Partial<Database['public']['Tables']['seller_submissions']['Insert']>, 'status'> & {
          status?: 'draft' | 'submitted' | 'withdrawn';
        };
        Relationships: [
          {
            foreignKeyName: 'seller_submissions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'seller_submissions_jurisdiction_id_fkey';
            columns: ['jurisdiction_id'];
            isOneToOne: false;
            referencedRelation: 'jurisdictions';
            referencedColumns: ['id'];
          },
        ];
      };
      submission_documents: {
        Row: {
          id: string;
          submission_id: string;
          owner_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          document_type: string;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          submission_id: string;
          owner_id?: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          document_type: string;
        };
        Update: never;
        Relationships: [];
      };
      staff_notes: {
        Row: {
          id: string;
          submission_id: string | null;
          asset_id: string | null;
          enquiry_id: string | null;
          author_id: string | null;
          body: string;
          created_at: Timestamp;
        };
        Insert: {
          submission_id?: string | null;
          asset_id?: string | null;
          enquiry_id?: string | null;
          body: string;
        };
        Update: never;
        Relationships: [];
      };
      enquiries: {
        Row: {
          id: string;
          asset_id: string;
          buyer_id: string | null;
          name: string;
          email: string;
          company: string | null;
          phone: string | null;
          buyer_type: string | null;
          message: string;
          nda_requested: boolean;
          consent: boolean;
          status: EnquiryStatus;
          handled_by: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: never;
        Update: {
          status?: EnquiryStatus;
        };
        Relationships: [
          {
            foreignKeyName: 'enquiries_asset_id_fkey';
            columns: ['asset_id'];
            isOneToOne: false;
            referencedRelation: 'assets';
            referencedColumns: ['id'];
          },
        ];
      };
      saved_listings: {
        Row: { user_id: string; asset_id: string; created_at: Timestamp };
        Insert: { user_id?: string; asset_id: string };
        Update: never;
        Relationships: [];
      };
      buyer_mandates: {
        Row: {
          id: string;
          buyer_id: string;
          title: string;
          category_ids: string[];
          jurisdiction_ids: string[];
          transaction_types: TransactionType[];
          min_budget: number | null;
          max_budget: number | null;
          currency: string;
          timeline: string | null;
          funding_source: string | null;
          requirements: string | null;
          status: MandateStatus;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          buyer_id?: string;
          title: string;
          category_ids?: string[];
          jurisdiction_ids?: string[];
          transaction_types?: TransactionType[];
          min_budget?: number | null;
          max_budget?: number | null;
          currency?: string;
          timeline?: string | null;
          funding_source?: string | null;
          requirements?: string | null;
          status?: MandateStatus;
        };
        Update: Partial<Omit<Database['public']['Tables']['buyer_mandates']['Insert'], 'buyer_id'>>;
        Relationships: [];
      };
      verification_records: {
        Row: {
          id: string;
          asset_id: string;
          level: VerificationLevel;
          method: string;
          source_reference: string | null;
          notes: string | null;
          reviewer_id: string | null;
          checked_at: Timestamp;
          is_demo: boolean;
          created_at: Timestamp;
        };
        Insert: {
          asset_id: string;
          level: VerificationLevel;
          method: string;
          source_reference?: string | null;
          notes?: string | null;
          checked_at?: Timestamp;
        };
        Update: never;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json;
          created_at: Timestamp;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      page_metadata: {
        Row: {
          path: string;
          title: string | null;
          description: string | null;
          og_image_url: string | null;
          noindex: boolean;
          updated_at: Timestamp;
          updated_by: string | null;
        };
        Insert: {
          path: string;
          title?: string | null;
          description?: string | null;
          og_image_url?: string | null;
          noindex?: boolean;
        };
        Update: Partial<Database['public']['Tables']['page_metadata']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      marketplace_listings: {
        Row: {
          id: string;
          reference_code: string;
          slug: string;
          title: string;
          summary: string;
          description: string | null;
          category_id: string;
          category_slug: string;
          category_name: string;
          jurisdiction_id: string;
          jurisdiction_slug: string;
          jurisdiction_name: string;
          jurisdiction_region: string;
          transaction_type: TransactionType;
          operating_status: OperatingStatus;
          asking_price: number | null;
          currency: string;
          price_on_request: boolean;
          asking_price_eur: number | null;
          licence_type: string | null;
          regulator: string | null;
          year_established: number | null;
          team_size: string | null;
          revenue_range: string | null;
          included_assets: string[];
          highlights: string[];
          verification_status: VerificationLevel;
          verified_at: Timestamp | null;
          status: 'published' | 'sold';
          is_demo: boolean;
          is_featured: boolean;
          published_at: Timestamp | null;
          sold_at: Timestamp | null;
          seo_title: string | null;
          seo_description: string | null;
          search_vector: unknown;
        };
        Relationships: [];
      };
    };
    Functions: {
      add_self_service_role: {
        Args: { p_role: AppRole };
        Returns: undefined;
      };
      withdraw_submission: {
        Args: { p_submission_id: string };
        Returns: undefined;
      };
      submit_enquiry: {
        Args: {
          p_asset_id: string;
          p_name: string;
          p_email: string;
          p_company?: string | null;
          p_phone?: string | null;
          p_buyer_type?: string | null;
          p_message: string;
          p_consent: boolean;
          p_nda_requested?: boolean;
        };
        Returns: string;
      };
      listing_counts: {
        Args: Record<string, never>;
        Returns: { kind: string; ref_id: string; listing_count: number }[];
      };
      start_submission_review: {
        Args: { p_submission_id: string };
        Returns: undefined;
      };
      request_submission_changes: {
        Args: { p_submission_id: string; p_feedback: string };
        Returns: undefined;
      };
      reject_submission: {
        Args: { p_submission_id: string; p_reason: string };
        Returns: undefined;
      };
      approve_submission: {
        Args: { p_submission_id: string; p_note?: string | null };
        Returns: string;
      };
      set_asset_status: {
        Args: { p_asset_id: string; p_status: AssetStatus; p_note?: string | null };
        Returns: undefined;
      };
      set_user_role: {
        Args: { p_user_id: string; p_role: AppRole; p_grant: boolean };
        Returns: undefined;
      };
      admin_list_users: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          email: string | null;
          full_name: string | null;
          company_name: string | null;
          roles: AppRole[];
          created_at: Timestamp;
          last_sign_in_at: Timestamp | null;
        }[];
      };
      admin_dashboard_stats: {
        Args: Record<string, never>;
        Returns: Json;
      };
    };
    Enums: {
      app_role: AppRole;
      asset_status: AssetStatus;
      verification_level: VerificationLevel;
      transaction_type: TransactionType;
      operating_status: OperatingStatus;
      submission_status: SubmissionStatus;
      enquiry_status: EnquiryStatus;
      mandate_status: MandateStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database['public'];
export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
export type Views<T extends keyof PublicSchema['Views']> = PublicSchema['Views'][T]['Row'];

export type Category = Tables<'categories'>;
export type Jurisdiction = Tables<'jurisdictions'>;
export type Asset = Tables<'assets'>;
export type Listing = Omit<Views<'marketplace_listings'>, 'search_vector'>;
export type Profile = Tables<'profiles'>;
export type SellerSubmission = Tables<'seller_submissions'>;
export type BuyerMandate = Tables<'buyer_mandates'>;
export type Enquiry = Tables<'enquiries'>;
export type VerificationRecord = Tables<'verification_records'>;
export type AuditLog = Tables<'audit_logs'>;
export type PageMetadata = Tables<'page_metadata'>;
export type SubmissionDocument = Tables<'submission_documents'>;
export type StaffNote = Tables<'staff_notes'>;
