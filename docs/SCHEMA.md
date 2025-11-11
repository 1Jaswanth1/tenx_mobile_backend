# 10xR Community Platform - Schema Overview

**Version:** 3.0  
**Last Updated:** November 2025  
**Schema Management:** Declarative (Supabase v2)

A concise overview of the complete database schema for the 10xR Community Platform. For detailed field-level documentation, see the full SQL files in `supabase/schemas/`.

---

## 📁 Schema Organization

We use **Supabase Declarative Schema Management** with modular schema files:

```
supabase/schemas/
├── types.sql              # Custom ENUM types (13 types)
├── auth.sql               # Better Auth tables (5 tables)
├── community_core.sql     # Users, communities, memberships (3 tables)
├── content.sql            # Posts, comments, votes (3 tables)
├── engagement.sql         # Saved, follows, notifications, reports (5 tables)
├── messaging.sql          # Direct messages (3 tables)
├── b2b_sales.sql          # Agencies, CRM (5 tables)
├── analytics.sql          # Tracking, metrics (2 tables)
└── functions.sql          # Triggers and stored procedures
└── rls_policies.sql       # Row Level Security Policies
```

**Total:** 29 tables, 13 custom types, 15+ trigger functions

---

## 🎯 Architecture: Three Layers

```
┌─────────────────────────────────────────────┐
│   LAYER 1: AUTHENTICATION (Better Auth)     │
│   • auth_users                               │
│   • auth_sessions                            │
│   • auth_accounts                            │
│   • auth_verification_tokens                 │
│   • auth_two_factor                          │
└──────────────────┬──────────────────────────┘
                   │ 1:1 relationship
┌──────────────────▼──────────────────────────┐
│   LAYER 2: PUBLIC COMMUNITY ("The Bait")    │
│   • users (anonymous identity)               │
│   • communities (subreddit-style)            │
│   • memberships (user ↔ community)          │
│   • posts, comments, votes                   │
│   • direct_conversations, direct_messages    │
│   • saved_posts, follows, notifications      │
└──────────────────┬──────────────────────────┘
                   │ Optional bridge
            [aide_profiles]
                   │
┌──────────────────▼──────────────────────────┐
│   LAYER 3: B2B SALES ENGINE ("The Payload") │
│   • agencies (CRM target list)               │
│   • aide_profiles (THE BRIDGE)               │
│   • agency_leads (inbound funnel)            │
│   • evangelist_rewards ($1K tracker)         │
│   • sales_activities (CRM log)               │
└─────────────────────────────────────────────┘
```

---

## 📊 Table Reference

### Authentication Layer (Better Auth)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `auth_users` | Primary auth identity | `id`, `email`, `email_verified` |
| `auth_sessions` | Active login sessions | `user_id`, `token`, `expires_at` |
| `auth_accounts` | OAuth providers | `user_id`, `provider`, `access_token` |
| `auth_verification_tokens` | Email/password reset | `identifier`, `token`, `expires_at` |
| `auth_two_factor` | 2FA configuration | `user_id`, `secret`, `backup_codes` |

**Access:** Managed by Better Auth library

---

### Community Platform Layer

#### Core Identity

| Table | Purpose | Key Fields | Strategic Features |
|-------|---------|------------|-------------------|
| `users` | Anonymous community persona | `username`, `karma`, `post_count` | Public identity separate from real name |
| `communities` | Subreddit-style forums | `name`, `slug`, `member_count` | **`allow_anonymous_posts`** |
| `memberships` | User ↔ Community join | `user_id`, `community_id`, `role` | **`flair_text`** (Data Engine) |

**Relationships:**
- `auth_users.id` → `users.auth_user_id` (1:1)
- `users.id` → `memberships.user_id` (1:many)
- `communities.id` → `memberships.community_id` (1:many)

---

#### Content & Engagement

| Table | Purpose | Key Fields | Strategic Features |
|-------|---------|------------|-------------------|
| `posts` | User submissions | `title`, `content`, `upvotes`, `score` | **`is_anonymous`** (Catharsis Engine) |
| `comments` | Threaded discussions | `content`, `parent_id`, `path`, `depth` | **`is_anonymous`**, nested threading |
| `votes` | Upvote/downvote | `user_id`, `votable_id`, `vote_type` | Polymorphic (posts + comments) |
| `saved_posts` | User bookmarks | `user_id`, `post_id` | - |
| `follows` | User-to-user | `follower_id`, `following_id` | - |
| `notifications` | Activity alerts | `user_id`, `type`, `is_read` | 9 notification types |
| `reports` | Content moderation | `reportable_id`, `report_type`, `status` | 6 report types |
| `user_blocks` | Privacy control | `blocker_id`, `blocked_id` | - |

**Content Types:** text, image, link, poll, video  
**Max Nesting:** 10 levels for comments  
**Polymorphic Voting:** posts OR comments

---

#### Messaging

| Table | Purpose | Key Fields | Strategic Features |
|-------|---------|------------|-------------------|
| `direct_conversations` | DM containers | `is_group`, `last_message_at` | **Sales Engine Channel 2** |
| `direct_conversation_participants` | Membership | `user_id`, `unread_count` | Read receipts, muting |
| `direct_messages` | Message content | `conversation_id`, `content`, `media_url` | 1-5,000 chars |

**Use Cases:**
- 1:1 private messaging
- Group chats (3+ participants)
- **Admin → Evangelist recruitment (B2B strategy)**

---

### B2B Sales Engine Layer

| Table | Purpose | Key Fields | Access Level | Strategic Feature |
|-------|---------|------------|--------------|-------------------|
| `agencies` | CRM target list | `name`, `status`, `avg_census`, `estimated_annual_value` | Admin-only | Sales pipeline tracking |
| `aide_profiles` | **THE BRIDGE** | `user_id`, `agency_id`, `role`, `years_of_experience`, `is_evangelist` | User (own) + Admin (all) | **Links anonymous to real identity** |
| `agency_leads` | Inbound funnel | `submitting_user_id`, `agency_name_raw`, `status` | User (submit) + Admin (process) | User-submitted leads |
| `evangelist_rewards` | $1K budget tracker | `user_id`, `agency_id`, `reward_amount_usd`, `status` | User (view own) + Admin (manage) | $1K per conversion |
| `sales_activities` | CRM activity log | `agency_id`, `activity_type`, `outcome` | Admin-only | Call/email/demo tracking |

**THE BRIDGE:**
```
users.id (anonymous) → aide_profiles.user_id → aide_profiles.agency_id → agencies.id (CRM)
```

**Pipeline Stages:** prospect → lead → contacted → demo_scheduled → negotiation → customer

---

### Analytics Layer

| Table | Purpose | Key Fields | Retention |
|-------|---------|------------|-----------|
| `user_activity_log` | Granular event tracking | `user_id`, `activity_type`, `activity_metadata` | 90 days |
| `daily_community_stats` | Aggregated metrics | `date`, `dau`, `new_posts`, `anonymous_posts_created` | Permanent |

**Activity Types:** page_view, post_create, comment_create, vote_cast, dm_sent, etc.

---

## 🎨 Custom Types (ENUMs)

### Community Types
- **`content_type`:** text, image, link, poll, video
- **`vote_type`:** upvote, downvote
- **`votable_type`:** post, comment
- **`member_role`:** member, moderator, admin

### Notification & Moderation
- **`notification_type`:** post_reply, comment_reply, new_follower, dm_received, etc. (9 types)
- **`report_type`:** spam, harassment, misinformation, inappropriate_content, hipaa_violation, other
- **`report_status`:** pending, under_review, resolved, dismissed

### B2B Sales Types
- **`agency_status`:** prospect, lead, contacted, demo_scheduled, negotiation, customer, churned, lost
- **`professional_role`:** aide, cna, lpn, rn, don, case_manager, social_worker, chaplain, admin_staff, owner, other
- **`verification_status`:** unverified, pending, verified, rejected
- **`lead_status`:** new, contacted, qualified, converted, invalid
- **`reward_status`:** pending, approved, paid, denied, cancelled

---

## ⚡ Strategic Features

### 1. The Catharsis Engine (Acquisition)
**Purpose:** Enable anonymous venting to attract users from Facebook

**Implementation:**
- `posts.is_anonymous BOOLEAN`
- `comments.is_anonymous BOOLEAN`
- `communities.allow_anonymous_posts BOOLEAN`

**Business Logic:**
- User creates post/comment with `is_anonymous = TRUE`
- Frontend hides `author_id`, displays "AnonymousAide"
- Backend still stores `author_id` (for moderation)
- RLS policies prevent other users from seeing `author_id`

**Impact:** 30%+ of posts are anonymous (vs 0% on Facebook)

---

### 2. The Data Engine (Pivot)
**Purpose:** Collect workforce data via voluntary flair system

**Implementation:**
- `memberships.flair_text TEXT` (public, voluntary)
- `aide_profiles.role professional_role` (private, opt-in)
- `aide_profiles.years_of_experience INTEGER` (private, opt-in)
- `aide_profiles.allow_data_aggregation BOOLEAN`

**Data Bomb Query:**
```sql
SELECT 
  role,
  COUNT(*) as headcount,
  AVG(years_of_experience) as avg_years
FROM aide_profiles
WHERE agency_id = 'target-uuid'
  AND verification_status = 'verified'
  AND allow_data_aggregation = TRUE
GROUP BY role;
```

**Sales Pitch:** "23 verified CNAs from your agency, avg 4.2 years experience..."

---

### 3. The Evangelist Army (Growth)
**Purpose:** Turn engaged users into sales reps with $1K incentive

**Implementation:**
- `aide_profiles.is_evangelist BOOLEAN`
- `agency_leads.submitting_user_id UUID` (attribution)
- `evangelist_rewards.reward_amount_usd NUMERIC` (default $1000)

**Flow:**
1. Admin identifies engaged user → Sets `is_evangelist = TRUE`
2. Admin DMs evangelist: "Want to earn $1K?"
3. Evangelist submits lead via `agency_leads`
4. Agency becomes customer → Auto-create `evangelist_rewards`
5. Admin approves → Send $1K

**ROI:** $1K payout for $24K+ ARR customer = 24x

---

### 4. The $0 Event Engine (Engagement)
**Purpose:** Community events without paid promotion

**Implementation:**
- `posts.is_pinned BOOLEAN`

**Usage:**
- Moderator creates event post
- Sets `is_pinned = TRUE`
- Always shown at top of feed
- Max 3 pinned posts per community

**Examples:** Weekly Check-In Thread, Monthly AMA, Best Practices Roundup

---

### 5. Sales Engine - Channel 2 (DMs)
**Purpose:** Private recruitment channel for evangelists

**Implementation:**
- `direct_conversations` + `direct_messages`

**Strategy:**
- Admin DMs potential evangelist
- "Hey @username, love your engagement! Interested in..."
- Private 1:1, personal touch
- High conversion vs email blasts

---

## 🔒 Security Model

### Row-Level Security (RLS)

**Public Content:**
- Anyone can SELECT unremoved posts/comments
- Users can INSERT/UPDATE their own content

**Private Data (aide_profiles):**
- Users can SELECT only their own profile
- Admins (service_role) bypass RLS, see all

**Admin-Only (agencies, CRM):**
- No public RLS policies
- Only service_role can access

**Anonymous Posts:**
- `author_id` stored but hidden by RLS
- User can still edit/delete own anonymous posts
- Moderators can see `author_id` (abuse prevention)

### Data Privacy

**PII Storage:**
- `auth_users.email` - Auth table only
- `aide_profiles.real_name` - Encrypted, admin-only
- `agencies.tax_id` - Encrypted

**Anonymization:**
- `user_activity_log.ip_address` - Auto-deleted after 90 days
- `posts.is_anonymous = TRUE` - `author_id` hidden

---

## 🚀 Getting Started

### 1. Review Documentation

- **`SETUP.md`** - Complete setup guide with Declarative Schema
- **`SUPABASE.md`** - Technical Supabase integration
- **`supabase/schemas/*.sql`** - Detailed field definitions

### 2. Local Development

```bash
# Start Supabase
supabase start

# Apply schema
supabase db reset

# Generate types
pnpm supabase:types

# Start dev server
pnpm dev
```

### 3. Making Changes

```bash
# Edit schema file
vim supabase/schemas/content.sql

# Generate migration
supabase db diff -f my_change

# Apply locally
supabase migration up

# Deploy to production
supabase db push
```

---

## 📈 Key Metrics

### Platform Health
- **DAU (Daily Active Users):** Track in `daily_community_stats`
- **Anonymous Usage:** `anonymous_posts_created / new_posts`
- **Community Growth:** `total_communities`, `member_count`

### B2B Sales
- **Pipeline Value:** SUM(`estimated_annual_value`) WHERE `status IN ('lead', 'contacted', 'demo_scheduled', 'negotiation')`
- **Conversion Rate:** `customer` count / total leads
- **Evangelist ROI:** Total ARR / Total rewards paid

---

**Schema Status:** ✅ Production Ready  
**Last Updated:** November 2025  
**Maintained By:** 10xR Engineering Team