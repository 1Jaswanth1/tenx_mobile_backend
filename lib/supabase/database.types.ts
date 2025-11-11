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
      agencies: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          assigned_sales_rep: string | null
          avg_census: number | null
          city: string | null
          contract_end_date: string | null
          contract_sent_at: string | null
          contract_signed_at: string | null
          county: string | null
          created_at: string | null
          customer_since: string | null
          demo_scheduled_at: string | null
          estimated_annual_value: number | null
          id: string
          internal_tags: string[] | null
          last_contacted_at: string | null
          lead_source: string | null
          legal_name: string | null
          main_email: string | null
          main_phone: string | null
          monthly_recurring_revenue: number | null
          name: string
          npi_number: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          primary_contact_title: string | null
          sales_notes: string | null
          state: string | null
          status: Database["public"]["Enums"]["agency_status"] | null
          tax_id: string | null
          updated_at: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          assigned_sales_rep?: string | null
          avg_census?: number | null
          city?: string | null
          contract_end_date?: string | null
          contract_sent_at?: string | null
          contract_signed_at?: string | null
          county?: string | null
          created_at?: string | null
          customer_since?: string | null
          demo_scheduled_at?: string | null
          estimated_annual_value?: number | null
          id?: string
          internal_tags?: string[] | null
          last_contacted_at?: string | null
          lead_source?: string | null
          legal_name?: string | null
          main_email?: string | null
          main_phone?: string | null
          monthly_recurring_revenue?: number | null
          name: string
          npi_number?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          primary_contact_title?: string | null
          sales_notes?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["agency_status"] | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          assigned_sales_rep?: string | null
          avg_census?: number | null
          city?: string | null
          contract_end_date?: string | null
          contract_sent_at?: string | null
          contract_signed_at?: string | null
          county?: string | null
          created_at?: string | null
          customer_since?: string | null
          demo_scheduled_at?: string | null
          estimated_annual_value?: number | null
          id?: string
          internal_tags?: string[] | null
          last_contacted_at?: string | null
          lead_source?: string | null
          legal_name?: string | null
          main_email?: string | null
          main_phone?: string | null
          monthly_recurring_revenue?: number | null
          name?: string
          npi_number?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          primary_contact_title?: string | null
          sales_notes?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["agency_status"] | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      agency_leads: {
        Row: {
          admin_notes: string | null
          agency_name_raw: string
          agency_size_estimate: string | null
          converted_at: string | null
          converted_to_customer: boolean | null
          created_at: string | null
          don_email_raw: string | null
          don_name_raw: string | null
          don_phone_raw: string | null
          follow_up_date: string | null
          id: string
          linked_agency_id: string | null
          processed_at: string | null
          processed_by_admin_id: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          submitting_user_id: string
          user_notes: string | null
        }
        Insert: {
          admin_notes?: string | null
          agency_name_raw: string
          agency_size_estimate?: string | null
          converted_at?: string | null
          converted_to_customer?: boolean | null
          created_at?: string | null
          don_email_raw?: string | null
          don_name_raw?: string | null
          don_phone_raw?: string | null
          follow_up_date?: string | null
          id?: string
          linked_agency_id?: string | null
          processed_at?: string | null
          processed_by_admin_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          submitting_user_id: string
          user_notes?: string | null
        }
        Update: {
          admin_notes?: string | null
          agency_name_raw?: string
          agency_size_estimate?: string | null
          converted_at?: string | null
          converted_to_customer?: boolean | null
          created_at?: string | null
          don_email_raw?: string | null
          don_name_raw?: string | null
          don_phone_raw?: string | null
          follow_up_date?: string | null
          id?: string
          linked_agency_id?: string | null
          processed_at?: string | null
          processed_by_admin_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          submitting_user_id?: string
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_leads_linked_agency_id_fkey"
            columns: ["linked_agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_leads_processed_by_admin_id_fkey"
            columns: ["processed_by_admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_leads_submitting_user_id_fkey"
            columns: ["submitting_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      aide_profiles: {
        Row: {
          agency_id: string | null
          allow_agency_verification: boolean | null
          allow_data_aggregation: boolean | null
          contact_availability: string | null
          created_at: string | null
          evangelist_activated_at: string | null
          evangelist_activated_by: string | null
          evangelist_notes: string | null
          id: string
          is_evangelist: boolean | null
          license_number: string | null
          license_state: string | null
          preferred_contact_method: string | null
          professional_email: string | null
          professional_phone: string | null
          real_name: string | null
          role: Database["public"]["Enums"]["professional_role"] | null
          updated_at: string | null
          user_id: string
          verification_method: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          verified_by: string | null
          years_of_experience: number | null
        }
        Insert: {
          agency_id?: string | null
          allow_agency_verification?: boolean | null
          allow_data_aggregation?: boolean | null
          contact_availability?: string | null
          created_at?: string | null
          evangelist_activated_at?: string | null
          evangelist_activated_by?: string | null
          evangelist_notes?: string | null
          id?: string
          is_evangelist?: boolean | null
          license_number?: string | null
          license_state?: string | null
          preferred_contact_method?: string | null
          professional_email?: string | null
          professional_phone?: string | null
          real_name?: string | null
          role?: Database["public"]["Enums"]["professional_role"] | null
          updated_at?: string | null
          user_id: string
          verification_method?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          years_of_experience?: number | null
        }
        Update: {
          agency_id?: string | null
          allow_agency_verification?: boolean | null
          allow_data_aggregation?: boolean | null
          contact_availability?: string | null
          created_at?: string | null
          evangelist_activated_at?: string | null
          evangelist_activated_by?: string | null
          evangelist_notes?: string | null
          id?: string
          is_evangelist?: boolean | null
          license_number?: string | null
          license_state?: string | null
          preferred_contact_method?: string | null
          professional_email?: string | null
          professional_phone?: string | null
          real_name?: string | null
          role?: Database["public"]["Enums"]["professional_role"] | null
          updated_at?: string | null
          user_id?: string
          verification_method?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "aide_profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aide_profiles_evangelist_activated_by_fkey"
            columns: ["evangelist_activated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aide_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aide_profiles_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_accounts: {
        Row: {
          access_token: string | null
          account_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          password: string | null
          provider: string
          refresh_token: string | null
          scope: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_id: string
          created_at?: string | null
          expires_at?: string | null
          id: string
          password?: string | null
          provider: string
          refresh_token?: string | null
          scope?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          password?: string | null
          provider?: string
          refresh_token?: string | null
          scope?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auth_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          token: string
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id: string
          ip_address?: string | null
          token: string
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          token?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auth_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_two_factor: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          enabled: boolean | null
          id: string
          secret: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id: string
          secret: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auth_two_factor_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "auth_users"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_users: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      auth_verification_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          identifier: string
          token: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id: string
          identifier: string
          token: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          identifier?: string
          token?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          depth: number | null
          downvotes: number | null
          edited_at: string | null
          id: string
          is_anonymous: boolean | null
          is_removed: boolean | null
          is_spam: boolean | null
          parent_id: string | null
          path: string | null
          post_id: string
          removed_reason: string | null
          reply_count: number | null
          root_id: string | null
          score: number | null
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          depth?: number | null
          downvotes?: number | null
          edited_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_removed?: boolean | null
          is_spam?: boolean | null
          parent_id?: string | null
          path?: string | null
          post_id: string
          removed_reason?: string | null
          reply_count?: number | null
          root_id?: string | null
          score?: number | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          depth?: number | null
          downvotes?: number | null
          edited_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_removed?: boolean | null
          is_spam?: boolean | null
          parent_id?: string | null
          path?: string | null
          post_id?: string
          removed_reason?: string | null
          reply_count?: number | null
          root_id?: string | null
          score?: number | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_root_id_fkey"
            columns: ["root_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          active_member_count: number | null
          allow_anonymous_posts: boolean | null
          banner_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          icon_url: string | null
          id: string
          is_nsfw: boolean | null
          is_private: boolean | null
          long_description: string | null
          member_count: number | null
          name: string
          post_count: number | null
          require_flair: boolean | null
          rules: Json | null
          slug: string
          tags: string[] | null
          theme_color: string | null
          updated_at: string | null
        }
        Insert: {
          active_member_count?: number | null
          allow_anonymous_posts?: boolean | null
          banner_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_nsfw?: boolean | null
          is_private?: boolean | null
          long_description?: string | null
          member_count?: number | null
          name: string
          post_count?: number | null
          require_flair?: boolean | null
          rules?: Json | null
          slug: string
          tags?: string[] | null
          theme_color?: string | null
          updated_at?: string | null
        }
        Update: {
          active_member_count?: number | null
          allow_anonymous_posts?: boolean | null
          banner_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_nsfw?: boolean | null
          is_private?: boolean | null
          long_description?: string | null
          member_count?: number | null
          name?: string
          post_count?: number | null
          require_flair?: boolean | null
          rules?: Json | null
          slug?: string
          tags?: string[] | null
          theme_color?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_community_stats: {
        Row: {
          active_users: number | null
          anonymous_comments_created: number | null
          anonymous_posts_created: number | null
          created_at: string | null
          date: string
          dau: number | null
          id: string
          new_comments: number | null
          new_dms: number | null
          new_posts: number | null
          new_users: number | null
          new_votes: number | null
          total_comments: number | null
          total_communities: number | null
          total_dms: number | null
          total_posts: number | null
          total_users: number | null
          total_votes: number | null
        }
        Insert: {
          active_users?: number | null
          anonymous_comments_created?: number | null
          anonymous_posts_created?: number | null
          created_at?: string | null
          date: string
          dau?: number | null
          id?: string
          new_comments?: number | null
          new_dms?: number | null
          new_posts?: number | null
          new_users?: number | null
          new_votes?: number | null
          total_comments?: number | null
          total_communities?: number | null
          total_dms?: number | null
          total_posts?: number | null
          total_users?: number | null
          total_votes?: number | null
        }
        Update: {
          active_users?: number | null
          anonymous_comments_created?: number | null
          anonymous_posts_created?: number | null
          created_at?: string | null
          date?: string
          dau?: number | null
          id?: string
          new_comments?: number | null
          new_dms?: number | null
          new_posts?: number | null
          new_users?: number | null
          new_votes?: number | null
          total_comments?: number | null
          total_communities?: number | null
          total_dms?: number | null
          total_posts?: number | null
          total_users?: number | null
          total_votes?: number | null
        }
        Relationships: []
      }
      direct_conversation_participants: {
        Row: {
          conversation_id: string
          is_muted: boolean | null
          joined_at: string | null
          last_read_at: string | null
          left_at: string | null
          unread_count: number | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          left_at?: string | null
          unread_count?: number | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          left_at?: string | null
          unread_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "direct_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_conversations: {
        Row: {
          created_at: string | null
          id: string
          is_group: boolean | null
          last_message_at: string | null
          last_message_author_id: string | null
          last_message_content: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          last_message_at?: string | null
          last_message_author_id?: string | null
          last_message_content?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          last_message_at?: string | null
          last_message_author_id?: string | null
          last_message_content?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "direct_conversations_last_message_author_id_fkey"
            columns: ["last_message_author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          author_id: string
          content: string
          conversation_id: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          media_type: string | null
          media_url: string | null
        }
        Insert: {
          author_id: string
          content: string
          conversation_id: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          media_type?: string | null
          media_url?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          conversation_id?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          media_type?: string | null
          media_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "direct_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      evangelist_rewards: {
        Row: {
          admin_notes: string | null
          agency_id: string
          approved_at: string | null
          approved_by_admin_id: string | null
          cancelled_reason: string | null
          created_at: string | null
          denied_reason: string | null
          id: string
          lead_id: string | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          reward_amount_usd: number | null
          reward_description: string | null
          status: Database["public"]["Enums"]["reward_status"] | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          user_notes: string | null
        }
        Insert: {
          admin_notes?: string | null
          agency_id: string
          approved_at?: string | null
          approved_by_admin_id?: string | null
          cancelled_reason?: string | null
          created_at?: string | null
          denied_reason?: string | null
          id?: string
          lead_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          reward_amount_usd?: number | null
          reward_description?: string | null
          status?: Database["public"]["Enums"]["reward_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          user_notes?: string | null
        }
        Update: {
          admin_notes?: string | null
          agency_id?: string
          approved_at?: string | null
          approved_by_admin_id?: string | null
          cancelled_reason?: string | null
          created_at?: string | null
          denied_reason?: string | null
          id?: string
          lead_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          reward_amount_usd?: number | null
          reward_description?: string | null
          status?: Database["public"]["Enums"]["reward_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evangelist_rewards_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evangelist_rewards_approved_by_admin_id_fkey"
            columns: ["approved_by_admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evangelist_rewards_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "agency_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evangelist_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          comment_count: number | null
          community_id: string
          flair_color: string | null
          flair_text: string | null
          is_banned: boolean | null
          is_muted: boolean | null
          joined_at: string | null
          last_active_at: string | null
          post_count: number | null
          role: Database["public"]["Enums"]["member_role"] | null
          user_id: string
        }
        Insert: {
          comment_count?: number | null
          community_id: string
          flair_color?: string | null
          flair_text?: string | null
          is_banned?: boolean | null
          is_muted?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          post_count?: number | null
          role?: Database["public"]["Enums"]["member_role"] | null
          user_id: string
        }
        Update: {
          comment_count?: number | null
          community_id?: string
          flair_color?: string | null
          flair_text?: string | null
          is_banned?: boolean | null
          is_muted?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          post_count?: number | null
          role?: Database["public"]["Enums"]["member_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          comment_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          post_id: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          post_id?: string | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          actor_id?: string | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          post_id?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          comment_count: number | null
          community_id: string
          content: string | null
          content_type: Database["public"]["Enums"]["content_type"] | null
          created_at: string | null
          downvotes: number | null
          edited_at: string | null
          id: string
          is_anonymous: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          is_removed: boolean | null
          is_spam: boolean | null
          last_activity_at: string | null
          link_metadata: Json | null
          link_url: string | null
          media_thumbnail_url: string | null
          media_url: string | null
          poll_ends_at: string | null
          poll_options: Json | null
          removed_reason: string | null
          score: number | null
          share_count: number | null
          slug: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          comment_count?: number | null
          community_id: string
          content?: string | null
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string | null
          downvotes?: number | null
          edited_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          is_removed?: boolean | null
          is_spam?: boolean | null
          last_activity_at?: string | null
          link_metadata?: Json | null
          link_url?: string | null
          media_thumbnail_url?: string | null
          media_url?: string | null
          poll_ends_at?: string | null
          poll_options?: Json | null
          removed_reason?: string | null
          score?: number | null
          share_count?: number | null
          slug?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          comment_count?: number | null
          community_id?: string
          content?: string | null
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string | null
          downvotes?: number | null
          edited_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          is_removed?: boolean | null
          is_spam?: boolean | null
          last_activity_at?: string | null
          link_metadata?: Json | null
          link_url?: string | null
          media_thumbnail_url?: string | null
          media_url?: string | null
          poll_ends_at?: string | null
          poll_options?: Json | null
          removed_reason?: string | null
          score?: number | null
          share_count?: number | null
          slug?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          additional_context: string | null
          created_at: string | null
          id: string
          reason: string
          report_type: Database["public"]["Enums"]["report_type"]
          reportable_id: string
          reportable_type: string
          reporter_id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
        }
        Insert: {
          additional_context?: string | null
          created_at?: string | null
          id?: string
          reason: string
          report_type: Database["public"]["Enums"]["report_type"]
          reportable_id: string
          reportable_type: string
          reporter_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Update: {
          additional_context?: string | null
          created_at?: string | null
          id?: string
          reason?: string
          report_type?: Database["public"]["Enums"]["report_type"]
          reportable_id?: string
          reportable_type?: string
          reporter_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_activities: {
        Row: {
          activity_type: string
          agency_id: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          logged_by: string | null
          next_action: string | null
          next_action_due_date: string | null
          outcome: string | null
          scheduled_at: string | null
          subject: string
        }
        Insert: {
          activity_type: string
          agency_id: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logged_by?: string | null
          next_action?: string | null
          next_action_due_date?: string | null
          outcome?: string | null
          scheduled_at?: string | null
          subject: string
        }
        Update: {
          activity_type?: string
          agency_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logged_by?: string | null
          next_action?: string | null
          next_action_due_date?: string | null
          outcome?: string | null
          scheduled_at?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_activities_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_activities_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          post_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          post_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          post_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_metadata: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_metadata?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_metadata?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string
          avatar_url: string | null
          ban_reason: string | null
          banned_until: string | null
          banner_url: string | null
          bio: string | null
          comment_count: number | null
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          is_banned: boolean | null
          karma: number | null
          last_seen_at: string | null
          location: string | null
          post_count: number | null
          updated_at: string | null
          username: string
          website: string | null
        }
        Insert: {
          auth_user_id: string
          avatar_url?: string | null
          ban_reason?: string | null
          banned_until?: string | null
          banner_url?: string | null
          bio?: string | null
          comment_count?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          is_banned?: boolean | null
          karma?: number | null
          last_seen_at?: string | null
          location?: string | null
          post_count?: number | null
          updated_at?: string | null
          username: string
          website?: string | null
        }
        Update: {
          auth_user_id?: string
          avatar_url?: string | null
          ban_reason?: string | null
          banned_until?: string | null
          banner_url?: string | null
          bio?: string | null
          comment_count?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          is_banned?: boolean | null
          karma?: number | null
          last_seen_at?: string | null
          location?: string | null
          post_count?: number | null
          updated_at?: string | null
          username?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_auth_user_id_fkey"
            columns: ["auth_user_id"]
            isOneToOne: true
            referencedRelation: "auth_users"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          votable_id: string
          votable_type: Database["public"]["Enums"]["votable_type"]
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          votable_id: string
          votable_type: Database["public"]["Enums"]["votable_type"]
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          votable_id?: string
          votable_type?: Database["public"]["Enums"]["votable_type"]
          vote_type?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agency_status:
        | "prospect"
        | "lead"
        | "contacted"
        | "demo_scheduled"
        | "negotiation"
        | "customer"
        | "churned"
        | "lost"
      content_type: "text" | "image" | "link" | "poll" | "video"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "invalid"
      member_role: "member" | "moderator" | "admin"
      notification_type:
        | "post_reply"
        | "comment_reply"
        | "post_upvote"
        | "comment_upvote"
        | "new_follower"
        | "mention"
        | "community_invite"
        | "dm_received"
        | "evangelist_reward"
      professional_role:
        | "aide"
        | "cna"
        | "lpn"
        | "rn"
        | "don"
        | "case_manager"
        | "social_worker"
        | "chaplain"
        | "admin_staff"
        | "owner"
        | "other"
      report_status: "pending" | "under_review" | "resolved" | "dismissed"
      report_type:
        | "spam"
        | "harassment"
        | "misinformation"
        | "inappropriate_content"
        | "hipaa_violation"
        | "other"
      reward_status: "pending" | "approved" | "paid" | "denied" | "cancelled"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
      votable_type: "post" | "comment"
      vote_type: "upvote" | "downvote"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agency_status: [
        "prospect",
        "lead",
        "contacted",
        "demo_scheduled",
        "negotiation",
        "customer",
        "churned",
        "lost",
      ],
      content_type: ["text", "image", "link", "poll", "video"],
      lead_status: ["new", "contacted", "qualified", "converted", "invalid"],
      member_role: ["member", "moderator", "admin"],
      notification_type: [
        "post_reply",
        "comment_reply",
        "post_upvote",
        "comment_upvote",
        "new_follower",
        "mention",
        "community_invite",
        "dm_received",
        "evangelist_reward",
      ],
      professional_role: [
        "aide",
        "cna",
        "lpn",
        "rn",
        "don",
        "case_manager",
        "social_worker",
        "chaplain",
        "admin_staff",
        "owner",
        "other",
      ],
      report_status: ["pending", "under_review", "resolved", "dismissed"],
      report_type: [
        "spam",
        "harassment",
        "misinformation",
        "inappropriate_content",
        "hipaa_violation",
        "other",
      ],
      reward_status: ["pending", "approved", "paid", "denied", "cancelled"],
      verification_status: ["unverified", "pending", "verified", "rejected"],
      votable_type: ["post", "comment"],
      vote_type: ["upvote", "downvote"],
    },
  },
} as const

