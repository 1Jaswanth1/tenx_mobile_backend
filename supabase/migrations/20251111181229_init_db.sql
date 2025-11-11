create type "public"."agency_status" as enum ('prospect', 'lead', 'contacted', 'demo_scheduled', 'negotiation', 'customer', 'churned', 'lost');

create type "public"."content_type" as enum ('text', 'image', 'link', 'poll', 'video');

create type "public"."lead_status" as enum ('new', 'contacted', 'qualified', 'converted', 'invalid');

create type "public"."member_role" as enum ('member', 'moderator', 'admin');

create type "public"."notification_type" as enum ('post_reply', 'comment_reply', 'post_upvote', 'comment_upvote', 'new_follower', 'mention', 'community_invite', 'dm_received', 'evangelist_reward');

create type "public"."professional_role" as enum ('aide', 'cna', 'lpn', 'rn', 'don', 'case_manager', 'social_worker', 'chaplain', 'admin_staff', 'owner', 'other');

create type "public"."report_status" as enum ('pending', 'under_review', 'resolved', 'dismissed');

create type "public"."report_type" as enum ('spam', 'harassment', 'misinformation', 'inappropriate_content', 'hipaa_violation', 'other');

create type "public"."reward_status" as enum ('pending', 'approved', 'paid', 'denied', 'cancelled');

create type "public"."verification_status" as enum ('unverified', 'pending', 'verified', 'rejected');

create type "public"."votable_type" as enum ('post', 'comment');

create type "public"."vote_type" as enum ('upvote', 'downvote');


  create table "public"."agencies" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "legal_name" text,
    "npi_number" text,
    "tax_id" text,
    "address_line1" text,
    "address_line2" text,
    "city" text,
    "state" text,
    "zip_code" text,
    "county" text,
    "website" text,
    "main_phone" text,
    "main_email" text,
    "primary_contact_name" text,
    "primary_contact_title" text,
    "primary_contact_email" text,
    "primary_contact_phone" text,
    "status" public.agency_status default 'prospect'::public.agency_status,
    "avg_census" integer default 0,
    "estimated_annual_value" numeric(10,2),
    "lead_source" text,
    "assigned_sales_rep" text,
    "demo_scheduled_at" timestamp with time zone,
    "contract_sent_at" timestamp with time zone,
    "contract_signed_at" timestamp with time zone,
    "sales_notes" text,
    "internal_tags" text[],
    "customer_since" timestamp with time zone,
    "monthly_recurring_revenue" numeric(10,2),
    "contract_end_date" date,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "last_contacted_at" timestamp with time zone
      );


alter table "public"."agencies" enable row level security;


  create table "public"."agency_leads" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "submitting_user_id" uuid not null,
    "agency_name_raw" text not null,
    "don_name_raw" text,
    "don_email_raw" text,
    "don_phone_raw" text,
    "agency_size_estimate" text,
    "user_notes" text,
    "status" public.lead_status default 'new'::public.lead_status,
    "processed_by_admin_id" uuid,
    "processed_at" timestamp with time zone,
    "linked_agency_id" uuid,
    "admin_notes" text,
    "follow_up_date" date,
    "converted_to_customer" boolean default false,
    "converted_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."agency_leads" enable row level security;


  create table "public"."aide_profiles" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "agency_id" uuid,
    "real_name" text,
    "professional_email" text,
    "professional_phone" text,
    "role" public.professional_role,
    "verification_status" public.verification_status default 'unverified'::public.verification_status,
    "verification_method" text,
    "verified_at" timestamp with time zone,
    "verified_by" uuid,
    "years_of_experience" integer,
    "license_number" text,
    "license_state" text,
    "is_evangelist" boolean default false,
    "evangelist_activated_at" timestamp with time zone,
    "evangelist_activated_by" uuid,
    "evangelist_notes" text,
    "preferred_contact_method" text,
    "contact_availability" text,
    "allow_agency_verification" boolean default true,
    "allow_data_aggregation" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."aide_profiles" enable row level security;


  create table "public"."auth_accounts" (
    "id" text not null,
    "user_id" uuid not null,
    "account_id" text not null,
    "provider" text not null,
    "access_token" text,
    "refresh_token" text,
    "expires_at" timestamp with time zone,
    "scope" text,
    "password" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."auth_accounts" enable row level security;


  create table "public"."auth_sessions" (
    "id" text not null,
    "user_id" uuid not null,
    "expires_at" timestamp with time zone not null,
    "token" text not null,
    "ip_address" text,
    "user_agent" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."auth_sessions" enable row level security;


  create table "public"."auth_two_factor" (
    "id" text not null,
    "user_id" uuid not null,
    "secret" text not null,
    "backup_codes" text[],
    "enabled" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."auth_two_factor" enable row level security;


  create table "public"."auth_users" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "email" text not null,
    "email_verified" boolean default false,
    "name" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."auth_users" enable row level security;


  create table "public"."auth_verification_tokens" (
    "id" text not null,
    "identifier" text not null,
    "token" text not null,
    "expires_at" timestamp with time zone not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."auth_verification_tokens" enable row level security;


  create table "public"."comments" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "content" text not null,
    "author_id" uuid not null,
    "post_id" uuid not null,
    "parent_id" uuid,
    "root_id" uuid,
    "depth" integer default 0,
    "path" text,
    "is_anonymous" boolean default false,
    "upvotes" integer default 0,
    "downvotes" integer default 0,
    "score" integer generated always as ((upvotes - downvotes)) stored,
    "reply_count" integer default 0,
    "is_removed" boolean default false,
    "is_spam" boolean default false,
    "removed_reason" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "edited_at" timestamp with time zone
      );


alter table "public"."comments" enable row level security;


  create table "public"."communities" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "slug" text not null,
    "description" text,
    "long_description" text,
    "icon_url" text,
    "banner_url" text,
    "theme_color" text default '#568AFF'::text,
    "rules" jsonb default '[]'::jsonb,
    "tags" text[],
    "is_private" boolean default false,
    "is_nsfw" boolean default false,
    "allow_anonymous_posts" boolean default true,
    "require_flair" boolean default false,
    "member_count" integer default 0,
    "post_count" integer default 0,
    "active_member_count" integer default 0,
    "created_by" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."communities" enable row level security;


  create table "public"."daily_community_stats" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "date" date not null,
    "total_users" integer default 0,
    "new_users" integer default 0,
    "active_users" integer default 0,
    "dau" integer default 0,
    "total_posts" integer default 0,
    "new_posts" integer default 0,
    "total_comments" integer default 0,
    "new_comments" integer default 0,
    "total_votes" integer default 0,
    "new_votes" integer default 0,
    "total_dms" integer default 0,
    "new_dms" integer default 0,
    "total_communities" integer default 0,
    "anonymous_posts_created" integer default 0,
    "anonymous_comments_created" integer default 0,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."daily_community_stats" enable row level security;


  create table "public"."direct_conversation_participants" (
    "conversation_id" uuid not null,
    "user_id" uuid not null,
    "is_muted" boolean default false,
    "last_read_at" timestamp with time zone,
    "unread_count" integer default 0,
    "joined_at" timestamp with time zone default now(),
    "left_at" timestamp with time zone
      );


alter table "public"."direct_conversation_participants" enable row level security;


  create table "public"."direct_conversations" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "is_group" boolean default false,
    "title" text,
    "last_message_content" text,
    "last_message_at" timestamp with time zone,
    "last_message_author_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."direct_conversations" enable row level security;


  create table "public"."direct_messages" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "conversation_id" uuid not null,
    "author_id" uuid not null,
    "content" text not null,
    "media_url" text,
    "media_type" text,
    "is_edited" boolean default false,
    "edited_at" timestamp with time zone,
    "is_deleted" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."direct_messages" enable row level security;


  create table "public"."evangelist_rewards" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "agency_id" uuid not null,
    "lead_id" uuid,
    "reward_description" text default '$1000 Team Wellness Budget'::text,
    "reward_amount_usd" numeric(10,2) default 1000.00,
    "status" public.reward_status default 'pending'::public.reward_status,
    "submitted_at" timestamp with time zone default now(),
    "approved_by_admin_id" uuid,
    "approved_at" timestamp with time zone,
    "paid_at" timestamp with time zone,
    "payment_method" text,
    "payment_reference" text,
    "admin_notes" text,
    "user_notes" text,
    "denied_reason" text,
    "cancelled_reason" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."evangelist_rewards" enable row level security;


  create table "public"."follows" (
    "follower_id" uuid not null,
    "following_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."follows" enable row level security;


  create table "public"."memberships" (
    "user_id" uuid not null,
    "community_id" uuid not null,
    "role" public.member_role default 'member'::public.member_role,
    "is_muted" boolean default false,
    "is_banned" boolean default false,
    "flair_text" text,
    "flair_color" text default '#568AFF'::text,
    "post_count" integer default 0,
    "comment_count" integer default 0,
    "last_active_at" timestamp with time zone default now(),
    "joined_at" timestamp with time zone default now()
      );


alter table "public"."memberships" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "type" public.notification_type not null,
    "title" text not null,
    "message" text,
    "link" text,
    "actor_id" uuid,
    "post_id" uuid,
    "comment_id" uuid,
    "is_read" boolean default false,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."notifications" enable row level security;


  create table "public"."posts" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "title" text not null,
    "content" text,
    "content_type" public.content_type default 'text'::public.content_type,
    "media_url" text,
    "media_thumbnail_url" text,
    "link_url" text,
    "link_metadata" jsonb,
    "poll_options" jsonb,
    "poll_ends_at" timestamp with time zone,
    "author_id" uuid not null,
    "community_id" uuid not null,
    "is_anonymous" boolean default false,
    "upvotes" integer default 0,
    "downvotes" integer default 0,
    "score" integer generated always as ((upvotes - downvotes)) stored,
    "comment_count" integer default 0,
    "view_count" integer default 0,
    "share_count" integer default 0,
    "is_pinned" boolean default false,
    "is_locked" boolean default false,
    "is_removed" boolean default false,
    "is_spam" boolean default false,
    "removed_reason" text,
    "slug" text,
    "tags" text[],
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "edited_at" timestamp with time zone,
    "last_activity_at" timestamp with time zone default now()
      );


alter table "public"."posts" enable row level security;


  create table "public"."reports" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "reporter_id" uuid not null,
    "reportable_id" uuid not null,
    "reportable_type" text not null,
    "report_type" public.report_type not null,
    "reason" text not null,
    "additional_context" text,
    "status" public.report_status default 'pending'::public.report_status,
    "resolved_by" uuid,
    "resolved_at" timestamp with time zone,
    "resolution_notes" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."reports" enable row level security;


  create table "public"."sales_activities" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "agency_id" uuid not null,
    "activity_type" text not null,
    "subject" text not null,
    "description" text,
    "outcome" text,
    "logged_by" uuid,
    "scheduled_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "next_action" text,
    "next_action_due_date" date,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."sales_activities" enable row level security;


  create table "public"."saved_posts" (
    "user_id" uuid not null,
    "post_id" uuid not null,
    "saved_at" timestamp with time zone default now()
      );


alter table "public"."saved_posts" enable row level security;


  create table "public"."user_activity_log" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "activity_type" text not null,
    "activity_metadata" jsonb,
    "session_id" text,
    "ip_address" text,
    "user_agent" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."user_activity_log" enable row level security;


  create table "public"."user_blocks" (
    "blocker_id" uuid not null,
    "blocked_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."user_blocks" enable row level security;


  create table "public"."users" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "auth_user_id" uuid not null,
    "username" text not null,
    "display_name" text,
    "avatar_url" text,
    "banner_url" text,
    "bio" text,
    "location" text,
    "website" text,
    "karma" integer default 0,
    "post_count" integer default 0,
    "comment_count" integer default 0,
    "is_active" boolean default true,
    "is_banned" boolean default false,
    "ban_reason" text,
    "banned_until" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "last_seen_at" timestamp with time zone default now()
      );


alter table "public"."users" enable row level security;


  create table "public"."votes" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "votable_id" uuid not null,
    "votable_type" public.votable_type not null,
    "vote_type" public.vote_type not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."votes" enable row level security;

CREATE UNIQUE INDEX agencies_npi_number_key ON public.agencies USING btree (npi_number);

CREATE UNIQUE INDEX agencies_pkey ON public.agencies USING btree (id);

CREATE UNIQUE INDEX agency_leads_pkey ON public.agency_leads USING btree (id);

CREATE UNIQUE INDEX aide_profiles_pkey ON public.aide_profiles USING btree (id);

CREATE UNIQUE INDEX aide_profiles_user_id_key ON public.aide_profiles USING btree (user_id);

CREATE UNIQUE INDEX auth_accounts_pkey ON public.auth_accounts USING btree (id);

CREATE UNIQUE INDEX auth_sessions_pkey ON public.auth_sessions USING btree (id);

CREATE UNIQUE INDEX auth_sessions_token_key ON public.auth_sessions USING btree (token);

CREATE UNIQUE INDEX auth_two_factor_pkey ON public.auth_two_factor USING btree (id);

CREATE UNIQUE INDEX auth_two_factor_user_id_key ON public.auth_two_factor USING btree (user_id);

CREATE UNIQUE INDEX auth_users_email_key ON public.auth_users USING btree (email);

CREATE UNIQUE INDEX auth_users_pkey ON public.auth_users USING btree (id);

CREATE UNIQUE INDEX auth_verification_tokens_pkey ON public.auth_verification_tokens USING btree (id);

CREATE UNIQUE INDEX auth_verification_tokens_token_key ON public.auth_verification_tokens USING btree (token);

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE UNIQUE INDEX communities_name_key ON public.communities USING btree (name);

CREATE UNIQUE INDEX communities_pkey ON public.communities USING btree (id);

CREATE UNIQUE INDEX communities_slug_key ON public.communities USING btree (slug);

CREATE UNIQUE INDEX daily_community_stats_date_key ON public.daily_community_stats USING btree (date);

CREATE UNIQUE INDEX daily_community_stats_pkey ON public.daily_community_stats USING btree (id);

CREATE UNIQUE INDEX direct_conversation_participants_pkey ON public.direct_conversation_participants USING btree (conversation_id, user_id);

CREATE UNIQUE INDEX direct_conversations_pkey ON public.direct_conversations USING btree (id);

CREATE UNIQUE INDEX direct_messages_pkey ON public.direct_messages USING btree (id);

CREATE UNIQUE INDEX evangelist_rewards_pkey ON public.evangelist_rewards USING btree (id);

CREATE UNIQUE INDEX follows_pkey ON public.follows USING btree (follower_id, following_id);

CREATE INDEX idx_agencies_estimated_value ON public.agencies USING btree (estimated_annual_value DESC);

CREATE INDEX idx_agencies_name ON public.agencies USING btree (name);

CREATE INDEX idx_agencies_npi ON public.agencies USING btree (npi_number) WHERE (npi_number IS NOT NULL);

CREATE INDEX idx_agencies_state ON public.agencies USING btree (state);

CREATE INDEX idx_agencies_status ON public.agencies USING btree (status);

CREATE INDEX idx_agency_leads_linked_agency ON public.agency_leads USING btree (linked_agency_id);

CREATE INDEX idx_agency_leads_status ON public.agency_leads USING btree (status, created_at DESC);

CREATE INDEX idx_agency_leads_submitter ON public.agency_leads USING btree (submitting_user_id);

CREATE INDEX idx_aide_profiles_agency_id ON public.aide_profiles USING btree (agency_id);

CREATE INDEX idx_aide_profiles_is_evangelist ON public.aide_profiles USING btree (is_evangelist) WHERE (is_evangelist = true);

CREATE INDEX idx_aide_profiles_role ON public.aide_profiles USING btree (role);

CREATE INDEX idx_aide_profiles_user_id ON public.aide_profiles USING btree (user_id);

CREATE INDEX idx_aide_profiles_verification_status ON public.aide_profiles USING btree (verification_status);

CREATE INDEX idx_auth_accounts_provider ON public.auth_accounts USING btree (provider, account_id);

CREATE INDEX idx_auth_accounts_user_id ON public.auth_accounts USING btree (user_id);

CREATE INDEX idx_auth_sessions_expires_at ON public.auth_sessions USING btree (expires_at);

CREATE INDEX idx_auth_sessions_token ON public.auth_sessions USING btree (token);

CREATE INDEX idx_auth_sessions_user_id ON public.auth_sessions USING btree (user_id);

CREATE INDEX idx_auth_users_email ON public.auth_users USING btree (email);

CREATE INDEX idx_auth_verification_tokens_identifier ON public.auth_verification_tokens USING btree (identifier);

CREATE INDEX idx_auth_verification_tokens_token ON public.auth_verification_tokens USING btree (token);

CREATE INDEX idx_comments_author_id ON public.comments USING btree (author_id);

CREATE INDEX idx_comments_parent_id ON public.comments USING btree (parent_id);

CREATE INDEX idx_comments_path ON public.comments USING btree (path);

CREATE INDEX idx_comments_post_id ON public.comments USING btree (post_id, created_at DESC);

CREATE INDEX idx_comments_root_id ON public.comments USING btree (root_id);

CREATE INDEX idx_comments_score ON public.comments USING btree (score DESC);

CREATE INDEX idx_communities_created_by ON public.communities USING btree (created_by);

CREATE INDEX idx_communities_member_count ON public.communities USING btree (member_count DESC);

CREATE INDEX idx_communities_slug ON public.communities USING btree (slug);

CREATE INDEX idx_communities_tags ON public.communities USING gin (tags);

CREATE INDEX idx_conversation_participants_user ON public.direct_conversation_participants USING btree (user_id, conversation_id);

CREATE INDEX idx_daily_stats_date ON public.daily_community_stats USING btree (date DESC);

CREATE INDEX idx_dm_messages_author ON public.direct_messages USING btree (author_id);

CREATE INDEX idx_dm_messages_convo ON public.direct_messages USING btree (conversation_id, created_at DESC);

CREATE INDEX idx_dm_participants_unread ON public.direct_conversation_participants USING btree (user_id, unread_count) WHERE (unread_count > 0);

CREATE INDEX idx_dm_participants_user ON public.direct_conversation_participants USING btree (user_id, last_read_at DESC);

CREATE INDEX idx_evangelist_rewards_agency_id ON public.evangelist_rewards USING btree (agency_id);

CREATE INDEX idx_evangelist_rewards_lead_id ON public.evangelist_rewards USING btree (lead_id);

CREATE INDEX idx_evangelist_rewards_status ON public.evangelist_rewards USING btree (status);

CREATE INDEX idx_evangelist_rewards_user_id ON public.evangelist_rewards USING btree (user_id, created_at DESC);

CREATE INDEX idx_follows_follower_id ON public.follows USING btree (follower_id);

CREATE INDEX idx_follows_following_id ON public.follows USING btree (following_id);

CREATE INDEX idx_memberships_community_id ON public.memberships USING btree (community_id);

CREATE INDEX idx_memberships_last_active ON public.memberships USING btree (last_active_at DESC);

CREATE INDEX idx_memberships_role ON public.memberships USING btree (role);

CREATE INDEX idx_memberships_user_community_role ON public.memberships USING btree (user_id, community_id, role);

CREATE INDEX idx_memberships_user_id ON public.memberships USING btree (user_id);

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (user_id, is_read, created_at DESC) WHERE (is_read = false);

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id, created_at DESC);

CREATE INDEX idx_posts_author_id ON public.posts USING btree (author_id);

CREATE INDEX idx_posts_community_id ON public.posts USING btree (community_id);

CREATE INDEX idx_posts_created_at ON public.posts USING btree (created_at DESC);

CREATE INDEX idx_posts_is_pinned ON public.posts USING btree (is_pinned, created_at DESC) WHERE (is_pinned = true);

CREATE INDEX idx_posts_last_activity ON public.posts USING btree (last_activity_at DESC);

CREATE INDEX idx_posts_score ON public.posts USING btree (score DESC);

CREATE INDEX idx_posts_slug ON public.posts USING btree (slug) WHERE (slug IS NOT NULL);

CREATE INDEX idx_posts_tags ON public.posts USING gin (tags);

CREATE INDEX idx_reports_reportable ON public.reports USING btree (reportable_id, reportable_type);

CREATE INDEX idx_reports_reporter_id ON public.reports USING btree (reporter_id);

CREATE INDEX idx_reports_status ON public.reports USING btree (status, created_at DESC);

CREATE INDEX idx_sales_activities_agency ON public.sales_activities USING btree (agency_id, created_at DESC);

CREATE INDEX idx_sales_activities_logged_by ON public.sales_activities USING btree (logged_by);

CREATE INDEX idx_sales_activities_scheduled ON public.sales_activities USING btree (scheduled_at) WHERE (scheduled_at IS NOT NULL);

CREATE INDEX idx_saved_posts_user_id ON public.saved_posts USING btree (user_id, saved_at DESC);

CREATE INDEX idx_user_activity_created_at ON public.user_activity_log USING btree (created_at DESC);

CREATE INDEX idx_user_activity_type ON public.user_activity_log USING btree (activity_type, created_at DESC);

CREATE INDEX idx_user_activity_user_id ON public.user_activity_log USING btree (user_id, created_at DESC);

CREATE INDEX idx_user_blocks_blocked ON public.user_blocks USING btree (blocked_id);

CREATE INDEX idx_user_blocks_blocker ON public.user_blocks USING btree (blocker_id);

CREATE INDEX idx_users_auth_user_id ON public.users USING btree (auth_user_id);

CREATE INDEX idx_users_auth_user_id_rls ON public.users USING btree (auth_user_id) WHERE ((is_active = true) AND (is_banned = false));

CREATE INDEX idx_users_created_at ON public.users USING btree (created_at DESC);

CREATE INDEX idx_users_karma ON public.users USING btree (karma DESC);

CREATE INDEX idx_users_username ON public.users USING btree (username);

CREATE INDEX idx_votes_user_id ON public.votes USING btree (user_id);

CREATE INDEX idx_votes_votable ON public.votes USING btree (votable_id, votable_type);

CREATE INDEX idx_votes_votable_type ON public.votes USING btree (votable_type, votable_id);

CREATE UNIQUE INDEX memberships_pkey ON public.memberships USING btree (user_id, community_id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX sales_activities_pkey ON public.sales_activities USING btree (id);

CREATE UNIQUE INDEX saved_posts_pkey ON public.saved_posts USING btree (user_id, post_id);

CREATE UNIQUE INDEX unique_provider_account ON public.auth_accounts USING btree (provider, account_id);

CREATE UNIQUE INDEX unique_vote ON public.votes USING btree (user_id, votable_id, votable_type);

CREATE UNIQUE INDEX user_activity_log_pkey ON public.user_activity_log USING btree (id);

CREATE UNIQUE INDEX user_blocks_pkey ON public.user_blocks USING btree (blocker_id, blocked_id);

CREATE UNIQUE INDEX users_auth_user_id_key ON public.users USING btree (auth_user_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);

CREATE UNIQUE INDEX votes_pkey ON public.votes USING btree (id);

alter table "public"."agencies" add constraint "agencies_pkey" PRIMARY KEY using index "agencies_pkey";

alter table "public"."agency_leads" add constraint "agency_leads_pkey" PRIMARY KEY using index "agency_leads_pkey";

alter table "public"."aide_profiles" add constraint "aide_profiles_pkey" PRIMARY KEY using index "aide_profiles_pkey";

alter table "public"."auth_accounts" add constraint "auth_accounts_pkey" PRIMARY KEY using index "auth_accounts_pkey";

alter table "public"."auth_sessions" add constraint "auth_sessions_pkey" PRIMARY KEY using index "auth_sessions_pkey";

alter table "public"."auth_two_factor" add constraint "auth_two_factor_pkey" PRIMARY KEY using index "auth_two_factor_pkey";

alter table "public"."auth_users" add constraint "auth_users_pkey" PRIMARY KEY using index "auth_users_pkey";

alter table "public"."auth_verification_tokens" add constraint "auth_verification_tokens_pkey" PRIMARY KEY using index "auth_verification_tokens_pkey";

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."communities" add constraint "communities_pkey" PRIMARY KEY using index "communities_pkey";

alter table "public"."daily_community_stats" add constraint "daily_community_stats_pkey" PRIMARY KEY using index "daily_community_stats_pkey";

alter table "public"."direct_conversation_participants" add constraint "direct_conversation_participants_pkey" PRIMARY KEY using index "direct_conversation_participants_pkey";

alter table "public"."direct_conversations" add constraint "direct_conversations_pkey" PRIMARY KEY using index "direct_conversations_pkey";

alter table "public"."direct_messages" add constraint "direct_messages_pkey" PRIMARY KEY using index "direct_messages_pkey";

alter table "public"."evangelist_rewards" add constraint "evangelist_rewards_pkey" PRIMARY KEY using index "evangelist_rewards_pkey";

alter table "public"."follows" add constraint "follows_pkey" PRIMARY KEY using index "follows_pkey";

alter table "public"."memberships" add constraint "memberships_pkey" PRIMARY KEY using index "memberships_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."sales_activities" add constraint "sales_activities_pkey" PRIMARY KEY using index "sales_activities_pkey";

alter table "public"."saved_posts" add constraint "saved_posts_pkey" PRIMARY KEY using index "saved_posts_pkey";

alter table "public"."user_activity_log" add constraint "user_activity_log_pkey" PRIMARY KEY using index "user_activity_log_pkey";

alter table "public"."user_blocks" add constraint "user_blocks_pkey" PRIMARY KEY using index "user_blocks_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."votes" add constraint "votes_pkey" PRIMARY KEY using index "votes_pkey";

alter table "public"."agencies" add constraint "agencies_npi_number_key" UNIQUE using index "agencies_npi_number_key";

alter table "public"."agencies" add constraint "name_length" CHECK (((char_length(name) >= 2) AND (char_length(name) <= 200))) not valid;

alter table "public"."agencies" validate constraint "name_length";

alter table "public"."agency_leads" add constraint "agency_leads_linked_agency_id_fkey" FOREIGN KEY (linked_agency_id) REFERENCES public.agencies(id) ON DELETE SET NULL not valid;

alter table "public"."agency_leads" validate constraint "agency_leads_linked_agency_id_fkey";

alter table "public"."agency_leads" add constraint "agency_leads_processed_by_admin_id_fkey" FOREIGN KEY (processed_by_admin_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."agency_leads" validate constraint "agency_leads_processed_by_admin_id_fkey";

alter table "public"."agency_leads" add constraint "agency_leads_submitting_user_id_fkey" FOREIGN KEY (submitting_user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."agency_leads" validate constraint "agency_leads_submitting_user_id_fkey";

alter table "public"."agency_leads" add constraint "agency_name_length" CHECK (((char_length(agency_name_raw) >= 2) AND (char_length(agency_name_raw) <= 200))) not valid;

alter table "public"."agency_leads" validate constraint "agency_name_length";

alter table "public"."aide_profiles" add constraint "aide_profiles_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES public.agencies(id) ON DELETE SET NULL not valid;

alter table "public"."aide_profiles" validate constraint "aide_profiles_agency_id_fkey";

alter table "public"."aide_profiles" add constraint "aide_profiles_evangelist_activated_by_fkey" FOREIGN KEY (evangelist_activated_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."aide_profiles" validate constraint "aide_profiles_evangelist_activated_by_fkey";

alter table "public"."aide_profiles" add constraint "aide_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."aide_profiles" validate constraint "aide_profiles_user_id_fkey";

alter table "public"."aide_profiles" add constraint "aide_profiles_user_id_key" UNIQUE using index "aide_profiles_user_id_key";

alter table "public"."aide_profiles" add constraint "aide_profiles_verified_by_fkey" FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."aide_profiles" validate constraint "aide_profiles_verified_by_fkey";

alter table "public"."aide_profiles" add constraint "years_experience_range" CHECK (((years_of_experience >= 0) AND (years_of_experience <= 70))) not valid;

alter table "public"."aide_profiles" validate constraint "years_experience_range";

alter table "public"."auth_accounts" add constraint "auth_accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE not valid;

alter table "public"."auth_accounts" validate constraint "auth_accounts_user_id_fkey";

alter table "public"."auth_accounts" add constraint "unique_provider_account" UNIQUE using index "unique_provider_account";

alter table "public"."auth_sessions" add constraint "auth_sessions_token_key" UNIQUE using index "auth_sessions_token_key";

alter table "public"."auth_sessions" add constraint "auth_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE not valid;

alter table "public"."auth_sessions" validate constraint "auth_sessions_user_id_fkey";

alter table "public"."auth_two_factor" add constraint "auth_two_factor_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE not valid;

alter table "public"."auth_two_factor" validate constraint "auth_two_factor_user_id_fkey";

alter table "public"."auth_two_factor" add constraint "auth_two_factor_user_id_key" UNIQUE using index "auth_two_factor_user_id_key";

alter table "public"."auth_users" add constraint "auth_users_email_key" UNIQUE using index "auth_users_email_key";

alter table "public"."auth_users" add constraint "email_format" CHECK ((email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)) not valid;

alter table "public"."auth_users" validate constraint "email_format";

alter table "public"."auth_verification_tokens" add constraint "auth_verification_tokens_token_key" UNIQUE using index "auth_verification_tokens_token_key";

alter table "public"."comments" add constraint "comments_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_author_id_fkey";

alter table "public"."comments" add constraint "comments_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_parent_id_fkey";

alter table "public"."comments" add constraint "comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_post_id_fkey";

alter table "public"."comments" add constraint "comments_root_id_fkey" FOREIGN KEY (root_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_root_id_fkey";

alter table "public"."comments" add constraint "content_length" CHECK (((char_length(content) >= 1) AND (char_length(content) <= 10000))) not valid;

alter table "public"."comments" validate constraint "content_length";

alter table "public"."comments" add constraint "max_depth" CHECK ((depth <= 10)) not valid;

alter table "public"."comments" validate constraint "max_depth";

alter table "public"."communities" add constraint "communities_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."communities" validate constraint "communities_created_by_fkey";

alter table "public"."communities" add constraint "communities_name_key" UNIQUE using index "communities_name_key";

alter table "public"."communities" add constraint "communities_slug_key" UNIQUE using index "communities_slug_key";

alter table "public"."communities" add constraint "description_length" CHECK ((char_length(description) <= 500)) not valid;

alter table "public"."communities" validate constraint "description_length";

alter table "public"."communities" add constraint "name_length" CHECK (((char_length(name) >= 3) AND (char_length(name) <= 50))) not valid;

alter table "public"."communities" validate constraint "name_length";

alter table "public"."communities" add constraint "slug_format" CHECK ((slug ~ '^[a-z0-9-]+$'::text)) not valid;

alter table "public"."communities" validate constraint "slug_format";

alter table "public"."daily_community_stats" add constraint "daily_community_stats_date_key" UNIQUE using index "daily_community_stats_date_key";

alter table "public"."direct_conversation_participants" add constraint "direct_conversation_participants_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.direct_conversations(id) ON DELETE CASCADE not valid;

alter table "public"."direct_conversation_participants" validate constraint "direct_conversation_participants_conversation_id_fkey";

alter table "public"."direct_conversation_participants" add constraint "direct_conversation_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."direct_conversation_participants" validate constraint "direct_conversation_participants_user_id_fkey";

alter table "public"."direct_conversations" add constraint "direct_conversations_last_message_author_id_fkey" FOREIGN KEY (last_message_author_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."direct_conversations" validate constraint "direct_conversations_last_message_author_id_fkey";

alter table "public"."direct_messages" add constraint "direct_messages_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."direct_messages" validate constraint "direct_messages_author_id_fkey";

alter table "public"."direct_messages" add constraint "direct_messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.direct_conversations(id) ON DELETE CASCADE not valid;

alter table "public"."direct_messages" validate constraint "direct_messages_conversation_id_fkey";

alter table "public"."direct_messages" add constraint "dm_content_length" CHECK (((char_length(content) >= 1) AND (char_length(content) <= 5000))) not valid;

alter table "public"."direct_messages" validate constraint "dm_content_length";

alter table "public"."evangelist_rewards" add constraint "evangelist_rewards_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES public.agencies(id) ON DELETE CASCADE not valid;

alter table "public"."evangelist_rewards" validate constraint "evangelist_rewards_agency_id_fkey";

alter table "public"."evangelist_rewards" add constraint "evangelist_rewards_approved_by_admin_id_fkey" FOREIGN KEY (approved_by_admin_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."evangelist_rewards" validate constraint "evangelist_rewards_approved_by_admin_id_fkey";

alter table "public"."evangelist_rewards" add constraint "evangelist_rewards_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES public.agency_leads(id) ON DELETE SET NULL not valid;

alter table "public"."evangelist_rewards" validate constraint "evangelist_rewards_lead_id_fkey";

alter table "public"."evangelist_rewards" add constraint "evangelist_rewards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."evangelist_rewards" validate constraint "evangelist_rewards_user_id_fkey";

alter table "public"."follows" add constraint "follows_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_follower_id_fkey";

alter table "public"."follows" add constraint "follows_following_id_fkey" FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_following_id_fkey";

alter table "public"."follows" add constraint "no_self_follow" CHECK ((follower_id <> following_id)) not valid;

alter table "public"."follows" validate constraint "no_self_follow";

alter table "public"."memberships" add constraint "flair_length" CHECK ((char_length(flair_text) <= 50)) not valid;

alter table "public"."memberships" validate constraint "flair_length";

alter table "public"."memberships" add constraint "memberships_community_id_fkey" FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE not valid;

alter table "public"."memberships" validate constraint "memberships_community_id_fkey";

alter table "public"."memberships" add constraint "memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."memberships" validate constraint "memberships_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."notifications" validate constraint "notifications_actor_id_fkey";

alter table "public"."notifications" add constraint "notifications_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_comment_id_fkey";

alter table "public"."notifications" add constraint "notifications_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_post_id_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."notifications" add constraint "title_length" CHECK ((char_length(title) <= 200)) not valid;

alter table "public"."notifications" validate constraint "title_length";

alter table "public"."posts" add constraint "content_length" CHECK ((char_length(content) <= 40000)) not valid;

alter table "public"."posts" validate constraint "content_length";

alter table "public"."posts" add constraint "posts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."posts" validate constraint "posts_author_id_fkey";

alter table "public"."posts" add constraint "posts_community_id_fkey" FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE not valid;

alter table "public"."posts" validate constraint "posts_community_id_fkey";

alter table "public"."posts" add constraint "title_length" CHECK (((char_length(title) >= 3) AND (char_length(title) <= 300))) not valid;

alter table "public"."posts" validate constraint "title_length";

alter table "public"."reports" add constraint "reason_length" CHECK (((char_length(reason) >= 10) AND (char_length(reason) <= 500))) not valid;

alter table "public"."reports" validate constraint "reason_length";

alter table "public"."reports" add constraint "reports_reporter_id_fkey" FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_reporter_id_fkey";

alter table "public"."reports" add constraint "reports_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."reports" validate constraint "reports_resolved_by_fkey";

alter table "public"."sales_activities" add constraint "sales_activities_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES public.agencies(id) ON DELETE CASCADE not valid;

alter table "public"."sales_activities" validate constraint "sales_activities_agency_id_fkey";

alter table "public"."sales_activities" add constraint "sales_activities_logged_by_fkey" FOREIGN KEY (logged_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."sales_activities" validate constraint "sales_activities_logged_by_fkey";

alter table "public"."sales_activities" add constraint "subject_length" CHECK (((char_length(subject) >= 3) AND (char_length(subject) <= 200))) not valid;

alter table "public"."sales_activities" validate constraint "subject_length";

alter table "public"."saved_posts" add constraint "saved_posts_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE not valid;

alter table "public"."saved_posts" validate constraint "saved_posts_post_id_fkey";

alter table "public"."saved_posts" add constraint "saved_posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."saved_posts" validate constraint "saved_posts_user_id_fkey";

alter table "public"."user_activity_log" add constraint "user_activity_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_activity_log" validate constraint "user_activity_log_user_id_fkey";

alter table "public"."user_blocks" add constraint "no_self_block" CHECK ((blocker_id <> blocked_id)) not valid;

alter table "public"."user_blocks" validate constraint "no_self_block";

alter table "public"."user_blocks" add constraint "user_blocks_blocked_id_fkey" FOREIGN KEY (blocked_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_blocks" validate constraint "user_blocks_blocked_id_fkey";

alter table "public"."user_blocks" add constraint "user_blocks_blocker_id_fkey" FOREIGN KEY (blocker_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_blocks" validate constraint "user_blocks_blocker_id_fkey";

alter table "public"."users" add constraint "bio_length" CHECK ((char_length(bio) <= 500)) not valid;

alter table "public"."users" validate constraint "bio_length";

alter table "public"."users" add constraint "username_format" CHECK ((username ~ '^[a-zA-Z0-9_-]+$'::text)) not valid;

alter table "public"."users" validate constraint "username_format";

alter table "public"."users" add constraint "username_length" CHECK (((char_length(username) >= 3) AND (char_length(username) <= 20))) not valid;

alter table "public"."users" validate constraint "username_length";

alter table "public"."users" add constraint "users_auth_user_id_fkey" FOREIGN KEY (auth_user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_auth_user_id_fkey";

alter table "public"."users" add constraint "users_auth_user_id_key" UNIQUE using index "users_auth_user_id_key";

alter table "public"."users" add constraint "users_username_key" UNIQUE using index "users_username_key";

alter table "public"."votes" add constraint "unique_vote" UNIQUE using index "unique_vote";

alter table "public"."votes" add constraint "votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_comment_path()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path = NEW.id::TEXT;
    NEW.depth = 0;
    NEW.root_id = NEW.id;
  ELSE
    SELECT path || '.' || NEW.id::TEXT, depth + 1, COALESCE(root_id, id)
    INTO NEW.path, NEW.depth, NEW.root_id
    FROM comments WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_notification_on_reply()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  post_author_id UUID;
  parent_author_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'comments' THEN
    -- Post reply
    IF NEW.parent_id IS NULL THEN
      SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
      IF NEW.author_id != post_author_id THEN
        INSERT INTO notifications (user_id, type, title, message, actor_id, post_id, comment_id)
        VALUES (
          post_author_id,
          'post_reply',
          'New reply on your post',
          LEFT(NEW.content, 100),
          NEW.author_id,
          NEW.post_id,
          NEW.id
        );
      END IF;
    ELSE
      -- Comment reply
      SELECT author_id INTO parent_author_id FROM comments WHERE id = NEW.parent_id;
      IF NEW.author_id != parent_author_id THEN
        INSERT INTO notifications (user_id, type, title, message, actor_id, post_id, comment_id)
        VALUES (
          parent_author_id,
          'comment_reply',
          'New reply on your comment',
          LEFT(NEW.content, 100),
          NEW.author_id,
          NEW.post_id,
          NEW.id
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_karma_on_vote_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF OLD.vote_type = 'upvote' THEN
    IF OLD.votable_type = 'post' THEN
      UPDATE users SET karma = karma - 1
      WHERE id = (SELECT author_id FROM posts WHERE id = OLD.votable_id);
    ELSIF OLD.votable_type = 'comment' THEN
      UPDATE users SET karma = karma - 1
      WHERE id = (SELECT author_id FROM comments WHERE id = OLD.votable_id);
    END IF;
  END IF;
  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_karma_on_vote()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.vote_type = 'upvote' THEN
    IF NEW.votable_type = 'post' THEN
      UPDATE users SET karma = karma + 1
      WHERE id = (SELECT author_id FROM posts WHERE id = NEW.votable_id);
    ELSIF NEW.votable_type = 'comment' THEN
      UPDATE users SET karma = karma + 1
      WHERE id = (SELECT author_id FROM comments WHERE id = NEW.votable_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_agency_estimated_value()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.avg_census IS NOT NULL THEN
    NEW.estimated_annual_value = NEW.avg_census * 40 * 12;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_community_member_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET member_count = member_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET member_count = member_count - 1
    WHERE id = OLD.community_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_community_post_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET post_count = post_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET post_count = post_count - 1
    WHERE id = OLD.community_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_post_comment_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1, last_activity_at = NOW()
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_vote_counts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.votable_type = 'post' THEN
      IF NEW.vote_type = 'upvote' THEN
        UPDATE posts SET upvotes = upvotes + 1 WHERE id = NEW.votable_id;
      ELSE
        UPDATE posts SET downvotes = downvotes + 1 WHERE id = NEW.votable_id;
      END IF;
    ELSIF NEW.votable_type = 'comment' THEN
      IF NEW.vote_type = 'upvote' THEN
        UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.votable_id;
      ELSE
        UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.votable_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.votable_type = 'post' THEN
      IF OLD.vote_type = 'upvote' THEN
        UPDATE posts SET upvotes = upvotes - 1 WHERE id = OLD.votable_id;
      ELSE
        UPDATE posts SET downvotes = downvotes - 1 WHERE id = OLD.votable_id;
      END IF;
    ELSIF OLD.votable_type = 'comment' THEN
      IF OLD.vote_type = 'upvote' THEN
        UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.votable_id;
      ELSE
        UPDATE comments SET downvotes = downvotes - 1 WHERE id = OLD.votable_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type != NEW.vote_type THEN
      IF NEW.votable_type = 'post' THEN
        IF NEW.vote_type = 'upvote' THEN
          UPDATE posts SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.votable_id;
        ELSE
          UPDATE posts SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.votable_id;
        END IF;
      ELSIF NEW.votable_type = 'comment' THEN
        IF NEW.vote_type = 'upvote' THEN
          UPDATE comments SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.votable_id;
        ELSE
          UPDATE comments SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.votable_id;
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$
;

grant delete on table "public"."agencies" to "anon";

grant insert on table "public"."agencies" to "anon";

grant references on table "public"."agencies" to "anon";

grant select on table "public"."agencies" to "anon";

grant trigger on table "public"."agencies" to "anon";

grant truncate on table "public"."agencies" to "anon";

grant update on table "public"."agencies" to "anon";

grant delete on table "public"."agencies" to "authenticated";

grant insert on table "public"."agencies" to "authenticated";

grant references on table "public"."agencies" to "authenticated";

grant select on table "public"."agencies" to "authenticated";

grant trigger on table "public"."agencies" to "authenticated";

grant truncate on table "public"."agencies" to "authenticated";

grant update on table "public"."agencies" to "authenticated";

grant delete on table "public"."agencies" to "service_role";

grant insert on table "public"."agencies" to "service_role";

grant references on table "public"."agencies" to "service_role";

grant select on table "public"."agencies" to "service_role";

grant trigger on table "public"."agencies" to "service_role";

grant truncate on table "public"."agencies" to "service_role";

grant update on table "public"."agencies" to "service_role";

grant delete on table "public"."agency_leads" to "anon";

grant insert on table "public"."agency_leads" to "anon";

grant references on table "public"."agency_leads" to "anon";

grant select on table "public"."agency_leads" to "anon";

grant trigger on table "public"."agency_leads" to "anon";

grant truncate on table "public"."agency_leads" to "anon";

grant update on table "public"."agency_leads" to "anon";

grant delete on table "public"."agency_leads" to "authenticated";

grant insert on table "public"."agency_leads" to "authenticated";

grant references on table "public"."agency_leads" to "authenticated";

grant select on table "public"."agency_leads" to "authenticated";

grant trigger on table "public"."agency_leads" to "authenticated";

grant truncate on table "public"."agency_leads" to "authenticated";

grant update on table "public"."agency_leads" to "authenticated";

grant delete on table "public"."agency_leads" to "service_role";

grant insert on table "public"."agency_leads" to "service_role";

grant references on table "public"."agency_leads" to "service_role";

grant select on table "public"."agency_leads" to "service_role";

grant trigger on table "public"."agency_leads" to "service_role";

grant truncate on table "public"."agency_leads" to "service_role";

grant update on table "public"."agency_leads" to "service_role";

grant delete on table "public"."aide_profiles" to "anon";

grant insert on table "public"."aide_profiles" to "anon";

grant references on table "public"."aide_profiles" to "anon";

grant select on table "public"."aide_profiles" to "anon";

grant trigger on table "public"."aide_profiles" to "anon";

grant truncate on table "public"."aide_profiles" to "anon";

grant update on table "public"."aide_profiles" to "anon";

grant delete on table "public"."aide_profiles" to "authenticated";

grant insert on table "public"."aide_profiles" to "authenticated";

grant references on table "public"."aide_profiles" to "authenticated";

grant select on table "public"."aide_profiles" to "authenticated";

grant trigger on table "public"."aide_profiles" to "authenticated";

grant truncate on table "public"."aide_profiles" to "authenticated";

grant update on table "public"."aide_profiles" to "authenticated";

grant delete on table "public"."aide_profiles" to "service_role";

grant insert on table "public"."aide_profiles" to "service_role";

grant references on table "public"."aide_profiles" to "service_role";

grant select on table "public"."aide_profiles" to "service_role";

grant trigger on table "public"."aide_profiles" to "service_role";

grant truncate on table "public"."aide_profiles" to "service_role";

grant update on table "public"."aide_profiles" to "service_role";

grant delete on table "public"."auth_accounts" to "anon";

grant insert on table "public"."auth_accounts" to "anon";

grant references on table "public"."auth_accounts" to "anon";

grant select on table "public"."auth_accounts" to "anon";

grant trigger on table "public"."auth_accounts" to "anon";

grant truncate on table "public"."auth_accounts" to "anon";

grant update on table "public"."auth_accounts" to "anon";

grant delete on table "public"."auth_accounts" to "authenticated";

grant insert on table "public"."auth_accounts" to "authenticated";

grant references on table "public"."auth_accounts" to "authenticated";

grant select on table "public"."auth_accounts" to "authenticated";

grant trigger on table "public"."auth_accounts" to "authenticated";

grant truncate on table "public"."auth_accounts" to "authenticated";

grant update on table "public"."auth_accounts" to "authenticated";

grant delete on table "public"."auth_accounts" to "service_role";

grant insert on table "public"."auth_accounts" to "service_role";

grant references on table "public"."auth_accounts" to "service_role";

grant select on table "public"."auth_accounts" to "service_role";

grant trigger on table "public"."auth_accounts" to "service_role";

grant truncate on table "public"."auth_accounts" to "service_role";

grant update on table "public"."auth_accounts" to "service_role";

grant delete on table "public"."auth_sessions" to "anon";

grant insert on table "public"."auth_sessions" to "anon";

grant references on table "public"."auth_sessions" to "anon";

grant select on table "public"."auth_sessions" to "anon";

grant trigger on table "public"."auth_sessions" to "anon";

grant truncate on table "public"."auth_sessions" to "anon";

grant update on table "public"."auth_sessions" to "anon";

grant delete on table "public"."auth_sessions" to "authenticated";

grant insert on table "public"."auth_sessions" to "authenticated";

grant references on table "public"."auth_sessions" to "authenticated";

grant select on table "public"."auth_sessions" to "authenticated";

grant trigger on table "public"."auth_sessions" to "authenticated";

grant truncate on table "public"."auth_sessions" to "authenticated";

grant update on table "public"."auth_sessions" to "authenticated";

grant delete on table "public"."auth_sessions" to "service_role";

grant insert on table "public"."auth_sessions" to "service_role";

grant references on table "public"."auth_sessions" to "service_role";

grant select on table "public"."auth_sessions" to "service_role";

grant trigger on table "public"."auth_sessions" to "service_role";

grant truncate on table "public"."auth_sessions" to "service_role";

grant update on table "public"."auth_sessions" to "service_role";

grant delete on table "public"."auth_two_factor" to "anon";

grant insert on table "public"."auth_two_factor" to "anon";

grant references on table "public"."auth_two_factor" to "anon";

grant select on table "public"."auth_two_factor" to "anon";

grant trigger on table "public"."auth_two_factor" to "anon";

grant truncate on table "public"."auth_two_factor" to "anon";

grant update on table "public"."auth_two_factor" to "anon";

grant delete on table "public"."auth_two_factor" to "authenticated";

grant insert on table "public"."auth_two_factor" to "authenticated";

grant references on table "public"."auth_two_factor" to "authenticated";

grant select on table "public"."auth_two_factor" to "authenticated";

grant trigger on table "public"."auth_two_factor" to "authenticated";

grant truncate on table "public"."auth_two_factor" to "authenticated";

grant update on table "public"."auth_two_factor" to "authenticated";

grant delete on table "public"."auth_two_factor" to "service_role";

grant insert on table "public"."auth_two_factor" to "service_role";

grant references on table "public"."auth_two_factor" to "service_role";

grant select on table "public"."auth_two_factor" to "service_role";

grant trigger on table "public"."auth_two_factor" to "service_role";

grant truncate on table "public"."auth_two_factor" to "service_role";

grant update on table "public"."auth_two_factor" to "service_role";

grant delete on table "public"."auth_users" to "anon";

grant insert on table "public"."auth_users" to "anon";

grant references on table "public"."auth_users" to "anon";

grant select on table "public"."auth_users" to "anon";

grant trigger on table "public"."auth_users" to "anon";

grant truncate on table "public"."auth_users" to "anon";

grant update on table "public"."auth_users" to "anon";

grant delete on table "public"."auth_users" to "authenticated";

grant insert on table "public"."auth_users" to "authenticated";

grant references on table "public"."auth_users" to "authenticated";

grant select on table "public"."auth_users" to "authenticated";

grant trigger on table "public"."auth_users" to "authenticated";

grant truncate on table "public"."auth_users" to "authenticated";

grant update on table "public"."auth_users" to "authenticated";

grant delete on table "public"."auth_users" to "service_role";

grant insert on table "public"."auth_users" to "service_role";

grant references on table "public"."auth_users" to "service_role";

grant select on table "public"."auth_users" to "service_role";

grant trigger on table "public"."auth_users" to "service_role";

grant truncate on table "public"."auth_users" to "service_role";

grant update on table "public"."auth_users" to "service_role";

grant delete on table "public"."auth_verification_tokens" to "anon";

grant insert on table "public"."auth_verification_tokens" to "anon";

grant references on table "public"."auth_verification_tokens" to "anon";

grant select on table "public"."auth_verification_tokens" to "anon";

grant trigger on table "public"."auth_verification_tokens" to "anon";

grant truncate on table "public"."auth_verification_tokens" to "anon";

grant update on table "public"."auth_verification_tokens" to "anon";

grant delete on table "public"."auth_verification_tokens" to "authenticated";

grant insert on table "public"."auth_verification_tokens" to "authenticated";

grant references on table "public"."auth_verification_tokens" to "authenticated";

grant select on table "public"."auth_verification_tokens" to "authenticated";

grant trigger on table "public"."auth_verification_tokens" to "authenticated";

grant truncate on table "public"."auth_verification_tokens" to "authenticated";

grant update on table "public"."auth_verification_tokens" to "authenticated";

grant delete on table "public"."auth_verification_tokens" to "service_role";

grant insert on table "public"."auth_verification_tokens" to "service_role";

grant references on table "public"."auth_verification_tokens" to "service_role";

grant select on table "public"."auth_verification_tokens" to "service_role";

grant trigger on table "public"."auth_verification_tokens" to "service_role";

grant truncate on table "public"."auth_verification_tokens" to "service_role";

grant update on table "public"."auth_verification_tokens" to "service_role";

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."communities" to "anon";

grant insert on table "public"."communities" to "anon";

grant references on table "public"."communities" to "anon";

grant select on table "public"."communities" to "anon";

grant trigger on table "public"."communities" to "anon";

grant truncate on table "public"."communities" to "anon";

grant update on table "public"."communities" to "anon";

grant delete on table "public"."communities" to "authenticated";

grant insert on table "public"."communities" to "authenticated";

grant references on table "public"."communities" to "authenticated";

grant select on table "public"."communities" to "authenticated";

grant trigger on table "public"."communities" to "authenticated";

grant truncate on table "public"."communities" to "authenticated";

grant update on table "public"."communities" to "authenticated";

grant delete on table "public"."communities" to "service_role";

grant insert on table "public"."communities" to "service_role";

grant references on table "public"."communities" to "service_role";

grant select on table "public"."communities" to "service_role";

grant trigger on table "public"."communities" to "service_role";

grant truncate on table "public"."communities" to "service_role";

grant update on table "public"."communities" to "service_role";

grant delete on table "public"."daily_community_stats" to "anon";

grant insert on table "public"."daily_community_stats" to "anon";

grant references on table "public"."daily_community_stats" to "anon";

grant select on table "public"."daily_community_stats" to "anon";

grant trigger on table "public"."daily_community_stats" to "anon";

grant truncate on table "public"."daily_community_stats" to "anon";

grant update on table "public"."daily_community_stats" to "anon";

grant delete on table "public"."daily_community_stats" to "authenticated";

grant insert on table "public"."daily_community_stats" to "authenticated";

grant references on table "public"."daily_community_stats" to "authenticated";

grant select on table "public"."daily_community_stats" to "authenticated";

grant trigger on table "public"."daily_community_stats" to "authenticated";

grant truncate on table "public"."daily_community_stats" to "authenticated";

grant update on table "public"."daily_community_stats" to "authenticated";

grant delete on table "public"."daily_community_stats" to "service_role";

grant insert on table "public"."daily_community_stats" to "service_role";

grant references on table "public"."daily_community_stats" to "service_role";

grant select on table "public"."daily_community_stats" to "service_role";

grant trigger on table "public"."daily_community_stats" to "service_role";

grant truncate on table "public"."daily_community_stats" to "service_role";

grant update on table "public"."daily_community_stats" to "service_role";

grant delete on table "public"."direct_conversation_participants" to "anon";

grant insert on table "public"."direct_conversation_participants" to "anon";

grant references on table "public"."direct_conversation_participants" to "anon";

grant select on table "public"."direct_conversation_participants" to "anon";

grant trigger on table "public"."direct_conversation_participants" to "anon";

grant truncate on table "public"."direct_conversation_participants" to "anon";

grant update on table "public"."direct_conversation_participants" to "anon";

grant delete on table "public"."direct_conversation_participants" to "authenticated";

grant insert on table "public"."direct_conversation_participants" to "authenticated";

grant references on table "public"."direct_conversation_participants" to "authenticated";

grant select on table "public"."direct_conversation_participants" to "authenticated";

grant trigger on table "public"."direct_conversation_participants" to "authenticated";

grant truncate on table "public"."direct_conversation_participants" to "authenticated";

grant update on table "public"."direct_conversation_participants" to "authenticated";

grant delete on table "public"."direct_conversation_participants" to "service_role";

grant insert on table "public"."direct_conversation_participants" to "service_role";

grant references on table "public"."direct_conversation_participants" to "service_role";

grant select on table "public"."direct_conversation_participants" to "service_role";

grant trigger on table "public"."direct_conversation_participants" to "service_role";

grant truncate on table "public"."direct_conversation_participants" to "service_role";

grant update on table "public"."direct_conversation_participants" to "service_role";

grant delete on table "public"."direct_conversations" to "anon";

grant insert on table "public"."direct_conversations" to "anon";

grant references on table "public"."direct_conversations" to "anon";

grant select on table "public"."direct_conversations" to "anon";

grant trigger on table "public"."direct_conversations" to "anon";

grant truncate on table "public"."direct_conversations" to "anon";

grant update on table "public"."direct_conversations" to "anon";

grant delete on table "public"."direct_conversations" to "authenticated";

grant insert on table "public"."direct_conversations" to "authenticated";

grant references on table "public"."direct_conversations" to "authenticated";

grant select on table "public"."direct_conversations" to "authenticated";

grant trigger on table "public"."direct_conversations" to "authenticated";

grant truncate on table "public"."direct_conversations" to "authenticated";

grant update on table "public"."direct_conversations" to "authenticated";

grant delete on table "public"."direct_conversations" to "service_role";

grant insert on table "public"."direct_conversations" to "service_role";

grant references on table "public"."direct_conversations" to "service_role";

grant select on table "public"."direct_conversations" to "service_role";

grant trigger on table "public"."direct_conversations" to "service_role";

grant truncate on table "public"."direct_conversations" to "service_role";

grant update on table "public"."direct_conversations" to "service_role";

grant delete on table "public"."direct_messages" to "anon";

grant insert on table "public"."direct_messages" to "anon";

grant references on table "public"."direct_messages" to "anon";

grant select on table "public"."direct_messages" to "anon";

grant trigger on table "public"."direct_messages" to "anon";

grant truncate on table "public"."direct_messages" to "anon";

grant update on table "public"."direct_messages" to "anon";

grant delete on table "public"."direct_messages" to "authenticated";

grant insert on table "public"."direct_messages" to "authenticated";

grant references on table "public"."direct_messages" to "authenticated";

grant select on table "public"."direct_messages" to "authenticated";

grant trigger on table "public"."direct_messages" to "authenticated";

grant truncate on table "public"."direct_messages" to "authenticated";

grant update on table "public"."direct_messages" to "authenticated";

grant delete on table "public"."direct_messages" to "service_role";

grant insert on table "public"."direct_messages" to "service_role";

grant references on table "public"."direct_messages" to "service_role";

grant select on table "public"."direct_messages" to "service_role";

grant trigger on table "public"."direct_messages" to "service_role";

grant truncate on table "public"."direct_messages" to "service_role";

grant update on table "public"."direct_messages" to "service_role";

grant delete on table "public"."evangelist_rewards" to "anon";

grant insert on table "public"."evangelist_rewards" to "anon";

grant references on table "public"."evangelist_rewards" to "anon";

grant select on table "public"."evangelist_rewards" to "anon";

grant trigger on table "public"."evangelist_rewards" to "anon";

grant truncate on table "public"."evangelist_rewards" to "anon";

grant update on table "public"."evangelist_rewards" to "anon";

grant delete on table "public"."evangelist_rewards" to "authenticated";

grant insert on table "public"."evangelist_rewards" to "authenticated";

grant references on table "public"."evangelist_rewards" to "authenticated";

grant select on table "public"."evangelist_rewards" to "authenticated";

grant trigger on table "public"."evangelist_rewards" to "authenticated";

grant truncate on table "public"."evangelist_rewards" to "authenticated";

grant update on table "public"."evangelist_rewards" to "authenticated";

grant delete on table "public"."evangelist_rewards" to "service_role";

grant insert on table "public"."evangelist_rewards" to "service_role";

grant references on table "public"."evangelist_rewards" to "service_role";

grant select on table "public"."evangelist_rewards" to "service_role";

grant trigger on table "public"."evangelist_rewards" to "service_role";

grant truncate on table "public"."evangelist_rewards" to "service_role";

grant update on table "public"."evangelist_rewards" to "service_role";

grant delete on table "public"."follows" to "anon";

grant insert on table "public"."follows" to "anon";

grant references on table "public"."follows" to "anon";

grant select on table "public"."follows" to "anon";

grant trigger on table "public"."follows" to "anon";

grant truncate on table "public"."follows" to "anon";

grant update on table "public"."follows" to "anon";

grant delete on table "public"."follows" to "authenticated";

grant insert on table "public"."follows" to "authenticated";

grant references on table "public"."follows" to "authenticated";

grant select on table "public"."follows" to "authenticated";

grant trigger on table "public"."follows" to "authenticated";

grant truncate on table "public"."follows" to "authenticated";

grant update on table "public"."follows" to "authenticated";

grant delete on table "public"."follows" to "service_role";

grant insert on table "public"."follows" to "service_role";

grant references on table "public"."follows" to "service_role";

grant select on table "public"."follows" to "service_role";

grant trigger on table "public"."follows" to "service_role";

grant truncate on table "public"."follows" to "service_role";

grant update on table "public"."follows" to "service_role";

grant delete on table "public"."memberships" to "anon";

grant insert on table "public"."memberships" to "anon";

grant references on table "public"."memberships" to "anon";

grant select on table "public"."memberships" to "anon";

grant trigger on table "public"."memberships" to "anon";

grant truncate on table "public"."memberships" to "anon";

grant update on table "public"."memberships" to "anon";

grant delete on table "public"."memberships" to "authenticated";

grant insert on table "public"."memberships" to "authenticated";

grant references on table "public"."memberships" to "authenticated";

grant select on table "public"."memberships" to "authenticated";

grant trigger on table "public"."memberships" to "authenticated";

grant truncate on table "public"."memberships" to "authenticated";

grant update on table "public"."memberships" to "authenticated";

grant delete on table "public"."memberships" to "service_role";

grant insert on table "public"."memberships" to "service_role";

grant references on table "public"."memberships" to "service_role";

grant select on table "public"."memberships" to "service_role";

grant trigger on table "public"."memberships" to "service_role";

grant truncate on table "public"."memberships" to "service_role";

grant update on table "public"."memberships" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."posts" to "anon";

grant insert on table "public"."posts" to "anon";

grant references on table "public"."posts" to "anon";

grant select on table "public"."posts" to "anon";

grant trigger on table "public"."posts" to "anon";

grant truncate on table "public"."posts" to "anon";

grant update on table "public"."posts" to "anon";

grant delete on table "public"."posts" to "authenticated";

grant insert on table "public"."posts" to "authenticated";

grant references on table "public"."posts" to "authenticated";

grant select on table "public"."posts" to "authenticated";

grant trigger on table "public"."posts" to "authenticated";

grant truncate on table "public"."posts" to "authenticated";

grant update on table "public"."posts" to "authenticated";

grant delete on table "public"."posts" to "service_role";

grant insert on table "public"."posts" to "service_role";

grant references on table "public"."posts" to "service_role";

grant select on table "public"."posts" to "service_role";

grant trigger on table "public"."posts" to "service_role";

grant truncate on table "public"."posts" to "service_role";

grant update on table "public"."posts" to "service_role";

grant delete on table "public"."reports" to "anon";

grant insert on table "public"."reports" to "anon";

grant references on table "public"."reports" to "anon";

grant select on table "public"."reports" to "anon";

grant trigger on table "public"."reports" to "anon";

grant truncate on table "public"."reports" to "anon";

grant update on table "public"."reports" to "anon";

grant delete on table "public"."reports" to "authenticated";

grant insert on table "public"."reports" to "authenticated";

grant references on table "public"."reports" to "authenticated";

grant select on table "public"."reports" to "authenticated";

grant trigger on table "public"."reports" to "authenticated";

grant truncate on table "public"."reports" to "authenticated";

grant update on table "public"."reports" to "authenticated";

grant delete on table "public"."reports" to "service_role";

grant insert on table "public"."reports" to "service_role";

grant references on table "public"."reports" to "service_role";

grant select on table "public"."reports" to "service_role";

grant trigger on table "public"."reports" to "service_role";

grant truncate on table "public"."reports" to "service_role";

grant update on table "public"."reports" to "service_role";

grant delete on table "public"."sales_activities" to "anon";

grant insert on table "public"."sales_activities" to "anon";

grant references on table "public"."sales_activities" to "anon";

grant select on table "public"."sales_activities" to "anon";

grant trigger on table "public"."sales_activities" to "anon";

grant truncate on table "public"."sales_activities" to "anon";

grant update on table "public"."sales_activities" to "anon";

grant delete on table "public"."sales_activities" to "authenticated";

grant insert on table "public"."sales_activities" to "authenticated";

grant references on table "public"."sales_activities" to "authenticated";

grant select on table "public"."sales_activities" to "authenticated";

grant trigger on table "public"."sales_activities" to "authenticated";

grant truncate on table "public"."sales_activities" to "authenticated";

grant update on table "public"."sales_activities" to "authenticated";

grant delete on table "public"."sales_activities" to "service_role";

grant insert on table "public"."sales_activities" to "service_role";

grant references on table "public"."sales_activities" to "service_role";

grant select on table "public"."sales_activities" to "service_role";

grant trigger on table "public"."sales_activities" to "service_role";

grant truncate on table "public"."sales_activities" to "service_role";

grant update on table "public"."sales_activities" to "service_role";

grant delete on table "public"."saved_posts" to "anon";

grant insert on table "public"."saved_posts" to "anon";

grant references on table "public"."saved_posts" to "anon";

grant select on table "public"."saved_posts" to "anon";

grant trigger on table "public"."saved_posts" to "anon";

grant truncate on table "public"."saved_posts" to "anon";

grant update on table "public"."saved_posts" to "anon";

grant delete on table "public"."saved_posts" to "authenticated";

grant insert on table "public"."saved_posts" to "authenticated";

grant references on table "public"."saved_posts" to "authenticated";

grant select on table "public"."saved_posts" to "authenticated";

grant trigger on table "public"."saved_posts" to "authenticated";

grant truncate on table "public"."saved_posts" to "authenticated";

grant update on table "public"."saved_posts" to "authenticated";

grant delete on table "public"."saved_posts" to "service_role";

grant insert on table "public"."saved_posts" to "service_role";

grant references on table "public"."saved_posts" to "service_role";

grant select on table "public"."saved_posts" to "service_role";

grant trigger on table "public"."saved_posts" to "service_role";

grant truncate on table "public"."saved_posts" to "service_role";

grant update on table "public"."saved_posts" to "service_role";

grant delete on table "public"."user_activity_log" to "anon";

grant insert on table "public"."user_activity_log" to "anon";

grant references on table "public"."user_activity_log" to "anon";

grant select on table "public"."user_activity_log" to "anon";

grant trigger on table "public"."user_activity_log" to "anon";

grant truncate on table "public"."user_activity_log" to "anon";

grant update on table "public"."user_activity_log" to "anon";

grant delete on table "public"."user_activity_log" to "authenticated";

grant insert on table "public"."user_activity_log" to "authenticated";

grant references on table "public"."user_activity_log" to "authenticated";

grant select on table "public"."user_activity_log" to "authenticated";

grant trigger on table "public"."user_activity_log" to "authenticated";

grant truncate on table "public"."user_activity_log" to "authenticated";

grant update on table "public"."user_activity_log" to "authenticated";

grant delete on table "public"."user_activity_log" to "service_role";

grant insert on table "public"."user_activity_log" to "service_role";

grant references on table "public"."user_activity_log" to "service_role";

grant select on table "public"."user_activity_log" to "service_role";

grant trigger on table "public"."user_activity_log" to "service_role";

grant truncate on table "public"."user_activity_log" to "service_role";

grant update on table "public"."user_activity_log" to "service_role";

grant delete on table "public"."user_blocks" to "anon";

grant insert on table "public"."user_blocks" to "anon";

grant references on table "public"."user_blocks" to "anon";

grant select on table "public"."user_blocks" to "anon";

grant trigger on table "public"."user_blocks" to "anon";

grant truncate on table "public"."user_blocks" to "anon";

grant update on table "public"."user_blocks" to "anon";

grant delete on table "public"."user_blocks" to "authenticated";

grant insert on table "public"."user_blocks" to "authenticated";

grant references on table "public"."user_blocks" to "authenticated";

grant select on table "public"."user_blocks" to "authenticated";

grant trigger on table "public"."user_blocks" to "authenticated";

grant truncate on table "public"."user_blocks" to "authenticated";

grant update on table "public"."user_blocks" to "authenticated";

grant delete on table "public"."user_blocks" to "service_role";

grant insert on table "public"."user_blocks" to "service_role";

grant references on table "public"."user_blocks" to "service_role";

grant select on table "public"."user_blocks" to "service_role";

grant trigger on table "public"."user_blocks" to "service_role";

grant truncate on table "public"."user_blocks" to "service_role";

grant update on table "public"."user_blocks" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."votes" to "anon";

grant insert on table "public"."votes" to "anon";

grant references on table "public"."votes" to "anon";

grant select on table "public"."votes" to "anon";

grant trigger on table "public"."votes" to "anon";

grant truncate on table "public"."votes" to "anon";

grant update on table "public"."votes" to "anon";

grant delete on table "public"."votes" to "authenticated";

grant insert on table "public"."votes" to "authenticated";

grant references on table "public"."votes" to "authenticated";

grant select on table "public"."votes" to "authenticated";

grant trigger on table "public"."votes" to "authenticated";

grant truncate on table "public"."votes" to "authenticated";

grant update on table "public"."votes" to "authenticated";

grant delete on table "public"."votes" to "service_role";

grant insert on table "public"."votes" to "service_role";

grant references on table "public"."votes" to "service_role";

grant select on table "public"."votes" to "service_role";

grant trigger on table "public"."votes" to "service_role";

grant truncate on table "public"."votes" to "service_role";

grant update on table "public"."votes" to "service_role";


  create policy "agency_leads_insert_authenticated"
  on "public"."agency_leads"
  as permissive
  for insert
  to authenticated
with check ((submitting_user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "agency_leads_select_own"
  on "public"."agency_leads"
  as permissive
  for select
  to authenticated
using ((submitting_user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "aide_profiles_insert_own"
  on "public"."aide_profiles"
  as permissive
  for insert
  to authenticated
with check (((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (is_evangelist = false)));



  create policy "aide_profiles_select_own"
  on "public"."aide_profiles"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "aide_profiles_update_own"
  on "public"."aide_profiles"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))))
with check (((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (( SELECT aide_profiles_1.is_evangelist
   FROM public.aide_profiles aide_profiles_1
  WHERE (aide_profiles_1.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid))))) = is_evangelist)));



  create policy "comments_delete_own"
  on "public"."comments"
  as permissive
  for delete
  to authenticated
using ((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "comments_insert_authenticated"
  on "public"."comments"
  as permissive
  for insert
  to authenticated
with check (((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (post_id IN ( SELECT posts.id
   FROM public.posts
  WHERE ((posts.is_removed = false) AND (posts.is_locked = false))))));



  create policy "comments_select_moderator"
  on "public"."comments"
  as permissive
  for select
  to authenticated
using ((post_id IN ( SELECT p.id
   FROM (public.posts p
     JOIN public.memberships m ON ((m.community_id = p.community_id)))
  WHERE ((m.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (m.role = ANY (ARRAY['moderator'::public.member_role, 'admin'::public.member_role]))))));



  create policy "comments_select_own_removed"
  on "public"."comments"
  as permissive
  for select
  to authenticated
using ((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "comments_select_public"
  on "public"."comments"
  as permissive
  for select
  to authenticated, anon
using (((is_removed = false) AND (post_id IN ( SELECT posts.id
   FROM public.posts
  WHERE (posts.is_removed = false)))));



  create policy "comments_update_moderator"
  on "public"."comments"
  as permissive
  for update
  to authenticated
using ((post_id IN ( SELECT p.id
   FROM (public.posts p
     JOIN public.memberships m ON ((m.community_id = p.community_id)))
  WHERE ((m.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (m.role = ANY (ARRAY['moderator'::public.member_role, 'admin'::public.member_role]))))));



  create policy "comments_update_own"
  on "public"."comments"
  as permissive
  for update
  to authenticated
using ((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))))
with check ((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "communities_insert_authenticated"
  on "public"."communities"
  as permissive
  for insert
  to authenticated
with check ((created_by = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "communities_select_member"
  on "public"."communities"
  as permissive
  for select
  to authenticated
using (((is_private = true) AND (id IN ( SELECT memberships.community_id
   FROM public.memberships
  WHERE (memberships.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid))))))));



  create policy "communities_select_public"
  on "public"."communities"
  as permissive
  for select
  to authenticated, anon
using ((is_private = false));



  create policy "communities_update_owner_admin"
  on "public"."communities"
  as permissive
  for update
  to authenticated
using (((created_by = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) OR (EXISTS ( SELECT 1
   FROM public.memberships
  WHERE ((memberships.community_id = communities.id) AND (memberships.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (memberships.role = 'admin'::public.member_role))))));



  create policy "daily_stats_select_public"
  on "public"."daily_community_stats"
  as permissive
  for select
  to authenticated, anon
using (true);



  create policy "participants_insert_system"
  on "public"."direct_conversation_participants"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "participants_select_own"
  on "public"."direct_conversation_participants"
  as permissive
  for select
  to authenticated
using ((conversation_id IN ( SELECT direct_conversation_participants_1.conversation_id
   FROM public.direct_conversation_participants direct_conversation_participants_1
  WHERE (direct_conversation_participants_1.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "participants_update_own"
  on "public"."direct_conversation_participants"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))))
with check ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "conversations_insert_participant"
  on "public"."direct_conversations"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "conversations_select_participant"
  on "public"."direct_conversations"
  as permissive
  for select
  to authenticated
using ((id IN ( SELECT direct_conversation_participants.conversation_id
   FROM public.direct_conversation_participants
  WHERE (direct_conversation_participants.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "conversations_update_participant"
  on "public"."direct_conversations"
  as permissive
  for update
  to authenticated
using ((id IN ( SELECT direct_conversation_participants.conversation_id
   FROM public.direct_conversation_participants
  WHERE (direct_conversation_participants.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "messages_delete_own"
  on "public"."direct_messages"
  as permissive
  for delete
  to authenticated
using ((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "messages_insert_participant"
  on "public"."direct_messages"
  as permissive
  for insert
  to authenticated
with check (((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (conversation_id IN ( SELECT direct_conversation_participants.conversation_id
   FROM public.direct_conversation_participants
  WHERE (direct_conversation_participants.user_id = direct_messages.author_id)))));



  create policy "messages_select_participant"
  on "public"."direct_messages"
  as permissive
  for select
  to authenticated
using ((conversation_id IN ( SELECT direct_conversation_participants.conversation_id
   FROM public.direct_conversation_participants
  WHERE (direct_conversation_participants.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "messages_update_own"
  on "public"."direct_messages"
  as permissive
  for update
  to authenticated
using ((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))))
with check ((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "evangelist_rewards_select_own"
  on "public"."evangelist_rewards"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "follows_delete_own"
  on "public"."follows"
  as permissive
  for delete
  to authenticated
using ((follower_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "follows_insert_own"
  on "public"."follows"
  as permissive
  for insert
  to authenticated
with check ((follower_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "follows_select_own"
  on "public"."follows"
  as permissive
  for select
  to authenticated
using (((follower_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) OR (following_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid))))));



  create policy "memberships_delete_own"
  on "public"."memberships"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "memberships_insert_own"
  on "public"."memberships"
  as permissive
  for insert
  to authenticated
with check (((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (role = 'member'::public.member_role)));



  create policy "memberships_select_own"
  on "public"."memberships"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "memberships_select_public_communities"
  on "public"."memberships"
  as permissive
  for select
  to authenticated, anon
using ((community_id IN ( SELECT communities.id
   FROM public.communities
  WHERE (communities.is_private = false))));



  create policy "memberships_update_admin"
  on "public"."memberships"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.memberships m
  WHERE ((m.community_id = memberships.community_id) AND (m.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (m.role = 'admin'::public.member_role)))));



  create policy "memberships_update_own_flair"
  on "public"."memberships"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))))
with check ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "notifications_delete_own"
  on "public"."notifications"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "notifications_insert_system"
  on "public"."notifications"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "notifications_select_own"
  on "public"."notifications"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "notifications_update_own"
  on "public"."notifications"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))))
with check ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "posts_delete_own"
  on "public"."posts"
  as permissive
  for delete
  to authenticated
using ((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "posts_insert_member"
  on "public"."posts"
  as permissive
  for insert
  to authenticated
with check (((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND ((EXISTS ( SELECT 1
   FROM public.memberships
  WHERE ((memberships.user_id = posts.author_id) AND (memberships.community_id = posts.community_id)))) OR (NOT (EXISTS ( SELECT 1
   FROM public.communities
  WHERE ((communities.id = posts.community_id) AND (communities.is_private = true))))))));



  create policy "posts_select_moderator"
  on "public"."posts"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.memberships
  WHERE ((memberships.community_id = posts.community_id) AND (memberships.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (memberships.role = ANY (ARRAY['moderator'::public.member_role, 'admin'::public.member_role]))))));



  create policy "posts_select_own_removed"
  on "public"."posts"
  as permissive
  for select
  to authenticated
using ((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "posts_select_public"
  on "public"."posts"
  as permissive
  for select
  to authenticated, anon
using (((is_removed = false) AND (community_id IN ( SELECT communities.id
   FROM public.communities
  WHERE (communities.is_private = false)))));



  create policy "posts_update_moderator"
  on "public"."posts"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.memberships
  WHERE ((memberships.community_id = posts.community_id) AND (memberships.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (memberships.role = ANY (ARRAY['moderator'::public.member_role, 'admin'::public.member_role]))))));



  create policy "posts_update_own"
  on "public"."posts"
  as permissive
  for update
  to authenticated
using (((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (is_locked = false)))
with check ((author_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "reports_insert_authenticated"
  on "public"."reports"
  as permissive
  for insert
  to authenticated
with check ((reporter_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "reports_select_moderator"
  on "public"."reports"
  as permissive
  for select
  to authenticated
using ((((reportable_type = 'post'::text) AND (reportable_id IN ( SELECT p.id
   FROM (public.posts p
     JOIN public.memberships m ON ((m.community_id = p.community_id)))
  WHERE ((m.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (m.role = ANY (ARRAY['moderator'::public.member_role, 'admin'::public.member_role])))))) OR ((reportable_type = 'comment'::text) AND (reportable_id IN ( SELECT c.id
   FROM ((public.comments c
     JOIN public.posts p ON ((p.id = c.post_id)))
     JOIN public.memberships m ON ((m.community_id = p.community_id)))
  WHERE ((m.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (m.role = ANY (ARRAY['moderator'::public.member_role, 'admin'::public.member_role]))))))));



  create policy "reports_select_own"
  on "public"."reports"
  as permissive
  for select
  to authenticated
using ((reporter_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "reports_update_moderator"
  on "public"."reports"
  as permissive
  for update
  to authenticated
using ((((reportable_type = 'post'::text) AND (reportable_id IN ( SELECT p.id
   FROM (public.posts p
     JOIN public.memberships m ON ((m.community_id = p.community_id)))
  WHERE ((m.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (m.role = ANY (ARRAY['moderator'::public.member_role, 'admin'::public.member_role])))))) OR ((reportable_type = 'comment'::text) AND (reportable_id IN ( SELECT c.id
   FROM ((public.comments c
     JOIN public.posts p ON ((p.id = c.post_id)))
     JOIN public.memberships m ON ((m.community_id = p.community_id)))
  WHERE ((m.user_id = ( SELECT users.id
           FROM public.users
          WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))) AND (m.role = ANY (ARRAY['moderator'::public.member_role, 'admin'::public.member_role]))))))));



  create policy "saved_posts_delete_own"
  on "public"."saved_posts"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "saved_posts_insert_own"
  on "public"."saved_posts"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "saved_posts_select_own"
  on "public"."saved_posts"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "activity_log_insert_own"
  on "public"."user_activity_log"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "user_blocks_delete_own"
  on "public"."user_blocks"
  as permissive
  for delete
  to authenticated
using ((blocker_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "user_blocks_insert_own"
  on "public"."user_blocks"
  as permissive
  for insert
  to authenticated
with check ((blocker_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "user_blocks_select_own"
  on "public"."user_blocks"
  as permissive
  for select
  to authenticated
using ((blocker_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "users_insert_own"
  on "public"."users"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = auth_user_id));



  create policy "users_select_own"
  on "public"."users"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = auth_user_id));



  create policy "users_select_public"
  on "public"."users"
  as permissive
  for select
  to authenticated, anon
using (((is_active = true) AND (is_banned = false)));



  create policy "users_update_own"
  on "public"."users"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = auth_user_id))
with check (((( SELECT auth.uid() AS uid) = auth_user_id) AND (is_active = true) AND (is_banned = false)));



  create policy "votes_delete_own"
  on "public"."votes"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "votes_insert_authenticated"
  on "public"."votes"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "votes_select_own"
  on "public"."votes"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));



  create policy "votes_update_own"
  on "public"."votes"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))))
with check ((user_id = ( SELECT users.id
   FROM public.users
  WHERE (users.auth_user_id = ( SELECT auth.uid() AS uid)))));


CREATE TRIGGER agency_value_trigger BEFORE INSERT OR UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_agency_estimated_value();

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aide_profiles_updated_at BEFORE UPDATE ON public.aide_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER comment_count_trigger AFTER INSERT OR DELETE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();

CREATE TRIGGER comment_path_trigger BEFORE INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.calculate_comment_path();

CREATE TRIGGER notification_on_comment_trigger AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_reply();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER member_count_trigger AFTER INSERT OR DELETE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();

CREATE TRIGGER post_count_trigger AFTER INSERT OR DELETE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_community_post_count();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER karma_on_vote_delete AFTER DELETE ON public.votes FOR EACH ROW EXECUTE FUNCTION public.decrement_karma_on_vote_delete();

CREATE TRIGGER karma_on_vote_insert AFTER INSERT ON public.votes FOR EACH ROW EXECUTE FUNCTION public.increment_karma_on_vote();

CREATE TRIGGER vote_counts_trigger AFTER INSERT OR DELETE OR UPDATE ON public.votes FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();


