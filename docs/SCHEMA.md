# 10XR Community Platform - Complete Schema Documentation

**Version:** 2.0  
**Last Updated:** November 2025  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Philosophy](#architecture-philosophy)
3. [Schema Components](#schema-components)
4. [Entity Relationships](#entity-relationships)
5. [Strategic Features Mapping](#strategic-features-mapping)
6. [Better Auth Integration](#better-auth-integration)
7. [Security & RLS](#security--rls)
8. [Performance Optimizations](#performance-optimizations)
9. [Implementation Guide](#implementation-guide)
10. [Admin Operations](#admin-operations)

---

## 🎯 Overview

This schema powers a **dual-purpose platform**:
1. **Public Community ("The Bait"):** Anonymous, Reddit-style forums for hospice workers
2. **B2B Sales Engine ("The Payload"):** Internal CRM for $10M ARR growth strategy

The architecture uses a **Decoupled Identity System** where:
- `auth_users` + `users` = anonymous community identity
- `aide_profiles` = private bridge to B2B sales targets
- `agencies` = internal CRM

---

## 🏗️ Architecture Philosophy

### The Three-Layer System

```
┌─────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION LAYER                      │
│                    (Better Auth Tables)                       │
│  auth_users, auth_sessions, auth_accounts, auth_2fa          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC COMMUNITY LAYER                     │
│                      ("The Bait")                             │
│  users, communities, posts, comments, votes, DMs              │
│  Strategic Features: Anonymous posting, User flairs          │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    [THE BRIDGE: aide_profiles]
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      B2B SALES LAYER                          │
│                     ("The Payload")                           │
│  agencies, agency_leads, evangelist_rewards, sales_activities│
│  Strategic Features: Data Bomb, Evangelist Army              │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Privacy First:** Anonymous community identity (username) is separate from real identity
2. **Opt-In Bridge:** Users choose to create `aide_profiles` linking to their agency
3. **Strategic Data Collection:** Flair system provides role data without forcing verification
4. **Dual Access Control:** Public RLS for community, service_role for B2B CRM

---

## 📊 Schema Components

### Section 1: Extensions (3)
- `uuid-ossp` - UUID generation
- `pgcrypto` - Encryption utilities
- `pg_stat_statements` - Performance monitoring

### Section 2: Custom Types (13)
- **Community Types:** `content_type`, `vote_type`, `votable_type`, `member_role`
- **Notification Types:** `notification_type`, `report_type`, `report_status`
- **B2B Types:** `agency_status`, `professional_role`, `verification_status`, `lead_status`, `reward_status`

### Section 3: Better Auth Tables (5)
| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `auth_users` | Primary auth identity | → `users.auth_user_id` |
| `auth_sessions` | Active user sessions | → `auth_users.id` |
| `auth_accounts` | OAuth providers | → `auth_users.id` |
| `auth_verification_tokens` | Email verification | Standalone |
| `auth_two_factor` | 2FA secrets | → `auth_users.id` |

### Section 4: Community Platform Tables (14)

#### Core Tables
| Table | Purpose | Strategic Feature |
|-------|---------|-------------------|
| `users` | Anonymous community identity | Public persona (username, karma) |
| `communities` | Subreddits (s/aides, s/nurses) | Audience segmentation |
| `memberships` | User ↔ Community joins | **Data Engine:** `flair_text` |
| `posts` | Content submissions | **Catharsis Engine:** `is_anonymous` |
| `comments` | Threaded discussions | **Catharsis Engine:** `is_anonymous` |
| `votes` | Upvote/downvote system | Engagement metrics |

#### Engagement Tables
| Table | Purpose |
|-------|---------|
| `saved_posts` | User bookmarks |
| `follows` | User-to-user following |
| `notifications` | Activity notifications |
| `reports` | Content moderation |

#### Messaging Tables
| Table | Purpose | Strategic Feature |
|-------|---------|-------------------|
| `direct_conversations` | DM containers | **Sales Engine:** Channel 2 |
| `direct_conversation_participants` | Participants in DMs | Unread tracking |
| `direct_messages` | DM content | Private outreach to evangelists |
| `user_blocks` | Privacy control | User safety |

### Section 5: B2B Sales Engine Tables (5)

| Table | Purpose | Access Level |
|-------|---------|--------------|
| `agencies` | CRM target list | Admin-only (service_role) |
| `aide_profiles` | **THE BRIDGE** | User (own) + Admin (all) |
| `agency_leads` | Inbound funnel | User (submit) + Admin (process) |
| `evangelist_rewards` | $1K budget tracker | User (view own) + Admin (manage) |
| `sales_activities` | CRM activity log | Admin-only |

### Section 6: Analytics Tables (2)
- `user_activity_log` - Granular event tracking
- `daily_community_stats` - Aggregated metrics

---

## 🔗 Entity Relationships

### Complete ERD

```mermaid
erDiagram
    %% AUTH LAYER
    auth_users ||--|| users : "1:1 (auth identity)"
    auth_users ||--o{ auth_sessions : "has sessions"
    auth_users ||--o{ auth_accounts : "has providers"
    auth_users ||--o| auth_two_factor : "has 2FA"
    
    %% COMMUNITY LAYER
    users ||--o{ posts : "authors"
    users ||--o{ comments : "authors"
    users ||--o{ votes : "casts"
    users ||--o{ memberships : "joins"
    users ||--o{ notifications : "receives"
    users ||--o{ direct_conversation_participants : "participates"
    users ||--o{ direct_messages : "sends"
    users ||--o{ follows : "follows/followed by"
    users ||--o{ saved_posts : "bookmarks"
    users ||--o{ reports : "submits"
    
    communities ||--o{ posts : "contains"
    communities ||--o{ memberships : "has members"
    
    posts ||--o{ comments : "has replies"
    posts ||--o{ votes : "receives votes"
    posts ||--o{ saved_posts : "bookmarked by"
    
    comments ||--o{ comments : "nested replies"
    comments ||--o{ votes : "receives votes"
    
    direct_conversations ||--o{ direct_conversation_participants : "has participants"
    direct_conversations ||--o{ direct_messages : "contains messages"
    
    %% THE BRIDGE
    users ||--o| aide_profiles : "HAS PRIVATE PROFILE"
    
    %% B2B LAYER
    agencies ||--o{ aide_profiles : "employs"
    agencies ||--o{ agency_leads : "linked to"
    agencies ||--o{ evangelist_rewards : "funds"
    agencies ||--o{ sales_activities : "tracked by"
    
    users ||--o{ agency_leads : "submits"
    users ||--o{ evangelist_rewards : "earns"
```

### Critical Relationships

#### 1. Authentication Bridge
```sql
auth_users.id (TEXT) → users.auth_user_id (TEXT)
-- 1:1 relationship
-- auth_users = Better Auth identity
-- users = Anonymous community persona
```

#### 2. The Strategic Bridge
```sql
users.id (UUID) → aide_profiles.user_id (UUID)
aide_profiles.agency_id (UUID) → agencies.id (UUID)
-- This is THE bridge from anonymous community to B2B CRM
-- Optional: Users can use platform without aide_profile
-- Private: aide_profile data never shown publicly
```

#### 3. Nested Comments
```sql
comments.parent_id → comments.id (self-referential)
comments.path (TEXT) -- Materialized path: "1.5.23.104"
comments.depth (INT) -- Nesting level (max 10)
comments.root_id → comments.id -- Top-level comment
```

---

## ⚡ Strategic Features Mapping

### Feature 1: The Catharsis Engine (Acquisition)

**Database Implementation:**
```sql
posts.is_anonymous BOOLEAN DEFAULT FALSE
comments.is_anonymous BOOLEAN DEFAULT FALSE
```

**Business Logic:**
- When `is_anonymous = TRUE`, hide `author_id` in frontend
- Display as "AnonymousAide" or "AnonymousNurse"
- This is the #1 differentiator vs. Facebook groups

**Impact:**
- Drives user acquisition from Facebook
- Provides psychological safety for venting
- Enables honest discussion of employer issues

### Feature 2: The Data Engine (Pivot)

**Database Implementation:**
```sql
memberships.flair_text TEXT
-- Example values: "RN - 10 Yrs", "DON", "CNA", "LPN"
```

**Business Logic:**
- Users self-select flair in each community
- This is PUBLIC data they voluntarily share
- No forced verification required

**Strategic Value:**
```sql
-- The "Data Bomb" Query
SELECT 
  ap.role,
  COUNT(*) as count,
  AVG(ap.years_of_experience) as avg_experience
FROM aide_profiles ap
WHERE ap.agency_id = 'target-agency-uuid'
  AND ap.allow_data_aggregation = TRUE
GROUP BY ap.role;
```

**Sales Pitch:**
"Mr. Owner, we have 94 of your staff on our platform:
- 80 CNAs (avg 5 years experience)
- 10 RNs (avg 8 years experience)
- 4 DONs (avg 15 years experience)

They're discussing burnout, turnover, and better opportunities. Let's talk about how 10xR can help you retain this team."

### Feature 3: The $0 Event Engine (Retention)

**Database Implementation:**
```sql
posts.is_pinned BOOLEAN DEFAULT FALSE
```

**Business Logic:**
- Admins can pin high-value posts (AMAs from experts)
- Example: "I'm a DON with 20 years experience, AMA"
- These stay at top of feed in communities

**Impact:**
- Provides massive free value
- Builds expert reputation system
- Drives retention without paid events

### Feature 4: The Sales Engine - Channel 2 (Conversion)

**Database Implementation:**
```sql
direct_conversations, direct_messages
aide_profiles.is_evangelist BOOLEAN
```

**Business Logic:**
1. Admin identifies high-karma users with flair="DON" or flair="RN-10Yrs"
2. Admin uses DMs to privately make "$1K Wellness Budget" offer
3. If user agrees, admin sets `aide_profiles.is_evangelist = TRUE`
4. Evangelist uses "[I WANT THIS FOR MY AGENCY]" button at their workplace

**Conversion Flow:**
```
Community User → High Karma + Flair → DM Outreach → 
Evangelist Activation → On-Site Sales → Agency Lead → 
Admin Processes → Closes Deal → Evangelist Reward
```

---

## 🔐 Better Auth Integration

### Setup Requirements

#### 1. Environment Variables
```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000/api/auth

# Database (Supabase)
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

#### 2. Auth Configuration (`lib/auth.ts`)
```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    // Add more providers as needed
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    generateId: () => crypto.randomUUID(), // UUID v4
  },
});
```

#### 3. User Creation Flow
```typescript
// When a new user signs up via Better Auth:
// 1. Better Auth creates record in auth_users
// 2. Your app creates corresponding record in users table

async function onUserSignup(authUserId: string, email: string) {
  const username = await generateUniqueUsername(email);
  
  await supabase.from('users').insert({
    auth_user_id: authUserId,
    username: username,
    display_name: username,
    karma: 0,
  });
}
```

### Auth Schema Details

#### Table: `auth_users`
Primary authentication table managed by Better Auth.

**Key Columns:**
- `id` (TEXT): Primary key, UUID format
- `email` (TEXT): Unique, user's email
- `email_verified` (BOOLEAN): Verification status
- `name` (TEXT): Optional display name

**Relationship:**
```sql
auth_users.id → users.auth_user_id (1:1)
```

#### Table: `auth_sessions`
Active user sessions.

**Key Columns:**
- `id` (TEXT): Session ID
- `user_id` (TEXT): Reference to `auth_users.id`
- `token` (TEXT): Session token
- `expires_at` (TIMESTAMP): Expiration time
- `ip_address`, `user_agent`: Security tracking

#### Table: `auth_accounts`
Multi-provider account support (OAuth).

**Key Columns:**
- `user_id` (TEXT): Reference to `auth_users.id`
- `provider` (TEXT): 'google', 'github', 'email', etc.
- `account_id` (TEXT): Provider's user ID
- `access_token`, `refresh_token`: OAuth tokens
- `password` (TEXT): Hashed password (for email/password auth)

**Unique Constraint:**
```sql
UNIQUE (provider, account_id)
-- Ensures one account per provider per user
```

#### Table: `auth_verification_tokens`
Email verification and password reset tokens.

**Key Columns:**
- `id` (TEXT): Token ID
- `identifier` (TEXT): Email or user_id
- `token` (TEXT): Unique verification token
- `expires_at` (TIMESTAMP): Token expiration

#### Table: `auth_two_factor`
Two-factor authentication setup.

**Key Columns:**
- `user_id` (TEXT): Reference to `auth_users.id`
- `secret` (TEXT): TOTP secret
- `backup_codes` (TEXT[]): Array of hashed backup codes
- `enabled` (BOOLEAN): 2FA status

---

## 🔒 Security & RLS

### RLS Philosophy

**Public Tables (Community):**
- Read: Open to authenticated users
- Write: Restricted to resource owners
- Moderation: Special policies for moderators/admins

**Private Tables (B2B):**
- `agencies`: Admin-only (service_role)
- `aide_profiles`: User sees own, Admin sees all
- `agency_leads`: User submits, Admin processes
- `evangelist_rewards`: User sees own, Admin manages
- `sales_activities`: Admin-only

### Critical RLS Policies

#### 1. Anonymous Content Protection
```sql
-- Posts: Anyone can view non-removed posts
CREATE POLICY "Anyone can view non-removed posts in public communities"
  ON posts FOR SELECT
  USING (
    is_removed = FALSE 
    AND community_id IN (
      SELECT id FROM communities WHERE is_private = FALSE
    )
  );
```

**Important:** The `is_anonymous` flag is handled in **application logic**, not RLS. RLS still returns `author_id`, but your frontend conditionally displays "AnonymousAide" instead of the username.

#### 2. The Bridge Protection
```sql
-- aide_profiles: Users can only see their own
CREATE POLICY "Users can view their own professional profile"
  ON aide_profiles FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));
```

**Critical:** Admin access requires `service_role` key, which bypasses RLS.

#### 3. Direct Messages Privacy
```sql
-- Only conversation participants can view messages
CREATE POLICY "Participants can view messages"
  ON direct_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM direct_conversation_participants
      WHERE user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );
```

### Service Role Operations

**Admin Dashboard** should use Supabase client with `service_role` key:

```typescript
// Admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypasses RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Example: View all aide profiles for a specific agency
const { data: profiles } = await supabaseAdmin
  .from('aide_profiles')
  .select('*')
  .eq('agency_id', targetAgencyId);

// Example: Update evangelist status
await supabaseAdmin
  .from('aide_profiles')
  .update({ is_evangelist: true, evangelist_activated_at: new Date() })
  .eq('user_id', userId);
```

---

## ⚙️ Performance Optimizations

### 1. Indexes
The schema includes **50+ indexes** for optimal query performance:

**Key Indexes:**
- `idx_posts_created_at` - Time-based post feeds
- `idx_posts_score` - Hot/top sorting
- `idx_comments_path` - Nested comment loading
- `idx_votes_votable` - Vote counting
- `idx_memberships_last_active` - Active user detection

### 2. Generated Columns
```sql
-- Automatic score calculation
posts.score INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED
comments.score INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED
```

### 3. Materialized View: Hot Posts
```sql
CREATE MATERIALIZED VIEW hot_posts AS
SELECT 
  p.*,
  -- Reddit-style hot ranking
  CASE 
    WHEN p.score > 0 THEN
      LOG(GREATEST(ABS(p.score), 1)) + 
      (EXTRACT(EPOCH FROM p.created_at) / 45000)
    ELSE 0
  END as hot_rank
FROM posts p
WHERE p.is_removed = FALSE
ORDER BY hot_rank DESC;
```

**Refresh Strategy:**
```sql
-- Refresh every 15 minutes (set up with pg_cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY hot_posts;
```

### 4. Trigger-Based Counters
All counts are maintained via triggers for O(1) reads:
- `posts.comment_count` - Updated on comment insert/delete
- `posts.upvotes/downvotes` - Updated on vote change
- `communities.member_count` - Updated on membership change
- `users.karma` - Updated on vote received

---

## 🚀 Implementation Guide

### Step 1: Database Setup

```bash
# 1. Create new Supabase project
# 2. Go to SQL Editor
# 3. Copy contents of complete_schema.sql
# 4. Execute (this will take 30-60 seconds)
```

### Step 2: Verify Schema
```sql
-- Check table count
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Should return 30+

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Should return 20+ tables

-- Verify default communities
SELECT name, slug FROM communities;
-- Should return 5 communities
```

### Step 3: Configure Better Auth

```typescript
// app/lib/auth.ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
});

export type Session = typeof auth.$Infer.Session;
```

### Step 4: Create Auth Endpoints

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Step 5: Set Up Admin Dashboard

```typescript
// app/admin/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const session = await auth.api.getSession();
  
  if (!session) redirect("/login");
  
  // Check if user is admin (you'll need to add is_admin to users table)
  const { data: user } = await supabase
    .from('users')
    .select('is_admin')
    .eq('auth_user_id', session.user.id)
    .single();
  
  if (!user?.is_admin) redirect("/");
  
  return <>{children}</>;
}
```

### Step 6: Test Core Flows

#### Flow 1: User Signup
```typescript
// 1. User signs up via Better Auth
const { data, error } = await authClient.signUp.email({
  email: "test@example.com",
  password: "securePassword123",
  name: "Test User",
});

// 2. Create corresponding community user
const username = generateUsername(data.user.email);
await supabase.from('users').insert({
  auth_user_id: data.user.id,
  username,
  display_name: username,
});
```

#### Flow 2: Create Anonymous Post
```typescript
async function createAnonymousPost(userId: string, communityId: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: "I'm exhausted and need to vent",
      content: "Today was really hard...",
      author_id: userId,
      community_id: communityId,
      is_anonymous: true, // The magic flag
      content_type: 'text',
    })
    .select()
    .single();
  
  return data;
}
```

#### Flow 3: Submit Agency Lead
```typescript
async function submitAgencyLead(userId: string, leadData: any) {
  const { data, error } = await supabase
    .from('agency_leads')
    .insert({
      submitting_user_id: userId,
      agency_name_raw: leadData.agencyName,
      don_name_raw: leadData.donName,
      don_email_raw: leadData.donEmail,
      user_notes: leadData.notes,
      status: 'new',
    })
    .select()
    .single();
  
  // Trigger notification to sales team
  await notifySalesTeam(data.id);
  
  return data;
}
```

---

## 👨‍💼 Admin Operations

### Operation 1: The Data Bomb Query

**Objective:** Show an agency owner how many of their staff are on the platform.

```sql
-- Run with service_role
SELECT 
  ap.role,
  COUNT(*) as staff_count,
  ROUND(AVG(ap.years_of_experience), 1) as avg_experience,
  COUNT(*) FILTER (WHERE m.last_active_at > NOW() - INTERVAL '30 days') as active_last_30_days
FROM aide_profiles ap
LEFT JOIN users u ON ap.user_id = u.id
LEFT JOIN memberships m ON u.id = m.user_id
WHERE ap.agency_id = 'target-agency-uuid-here'
  AND ap.allow_data_aggregation = TRUE
  AND ap.verification_status = 'verified'
GROUP BY ap.role
ORDER BY staff_count DESC;
```

**Expected Output:**
```
role        | staff_count | avg_experience | active_last_30_days
------------|-------------|----------------|--------------------
aide        | 80          | 4.5            | 62
rn          | 10          | 8.2            | 9
lpn         | 4           | 6.0            | 3
```

**Sales Script:**
"Mr. Owner, I want to share something with you. We have **94 of your staff** actively using our platform. 80 CNAs, 10 RNs, and 4 LPNs. They're having conversations about burnout, turnover, and better opportunities. The data shows **74% were active in the last 30 days**. This represents your entire front line. Let me show you how 10xR can help you support and retain this team before they leave."

### Operation 2: Identify Evangelist Candidates

```sql
-- Find high-karma users with leadership flairs who are verified
SELECT 
  u.id,
  u.username,
  u.karma,
  ap.role,
  ap.years_of_experience,
  ap.verification_status,
  STRING_AGG(m.flair_text, ', ') as flairs,
  COUNT(DISTINCT p.id) as post_count,
  COUNT(DISTINCT c.id) as comment_count
FROM users u
JOIN aide_profiles ap ON u.id = ap.user_id
LEFT JOIN memberships m ON u.id = m.user_id
LEFT JOIN posts p ON u.id = p.author_id
LEFT JOIN comments c ON u.id = c.author_id
WHERE u.karma > 500
  AND ap.role IN ('don', 'rn', 'case_manager')
  AND ap.verification_status = 'verified'
  AND ap.is_evangelist = FALSE
GROUP BY u.id, u.username, u.karma, ap.role, ap.years_of_experience, ap.verification_status
ORDER BY u.karma DESC
LIMIT 50;
```

### Operation 3: Activate Evangelist

```typescript
async function activateEvangelist(
  userId: string,
  adminId: string,
  notes: string
) {
  // 1. Update aide_profile
  await supabaseAdmin
    .from('aide_profiles')
    .update({
      is_evangelist: true,
      evangelist_activated_at: new Date(),
      evangelist_activated_by: adminId,
      evangelist_notes: notes,
    })
    .eq('user_id', userId);
  
  // 2. Send DM with offer
  const conversation = await createDMConversation([adminId, userId]);
  await sendDM(conversation.id, adminId, `
    Hi! We've noticed your valuable contributions to the community. 
    We'd love to partner with you in a special way.
    
    We're offering a $1,000 Team Wellness Budget to advocates who 
    help bring 10xR to their agencies. This could be team outings, 
    wellness activities, or anything that supports your team.
    
    Would you be interested in learning more?
  `);
  
  // 3. Log in CRM
  await supabaseAdmin.from('sales_activities').insert({
    activity_type: 'evangelist_activation',
    description: `Activated ${userId} as evangelist`,
    notes: notes,
  });
}
```

### Operation 4: Process Agency Lead

```typescript
async function processAgencyLead(leadId: string, adminId: string) {
  // 1. Get lead details
  const { data: lead } = await supabaseAdmin
    .from('agency_leads')
    .select('*')
    .eq('id', leadId)
    .single();
  
  // 2. Check if agency exists in CRM
  let agency = await supabaseAdmin
    .from('agencies')
    .select('*')
    .ilike('name', `%${lead.agency_name_raw}%`)
    .single();
  
  // 3. Create agency if doesn't exist
  if (!agency) {
    const { data: newAgency } = await supabaseAdmin
      .from('agencies')
      .insert({
        name: lead.agency_name_raw,
        primary_contact_name: lead.don_name_raw,
        primary_contact_email: lead.don_email_raw,
        status: 'lead',
        lead_source: 'inbound',
      })
      .select()
      .single();
    
    agency = newAgency;
  }
  
  // 4. Link lead to agency
  await supabaseAdmin
    .from('agency_leads')
    .update({
      linked_agency_id: agency.id,
      status: 'qualified',
      processed_by_admin_id: adminId,
      processed_at: new Date(),
    })
    .eq('id', leadId);
  
  // 5. Create sales activity
  await supabaseAdmin.from('sales_activities').insert({
    agency_id: agency.id,
    activity_type: 'inbound_lead',
    subject: 'New inbound lead from community',
    description: `Lead submitted by user. Notes: ${lead.user_notes}`,
    logged_by: adminId,
  });
  
  return agency;
}
```

### Operation 5: Award Evangelist Reward

```typescript
async function awardEvangelistReward(
  agencyId: string,
  leadId: string,
  adminId: string
) {
  // 1. Find the evangelist (submitter of the lead)
  const { data: lead } = await supabaseAdmin
    .from('agency_leads')
    .select('submitting_user_id')
    .eq('id', leadId)
    .single();
  
  // 2. Verify agency is now a customer
  const { data: agency } = await supabaseAdmin
    .from('agencies')
    .select('status')
    .eq('id', agencyId)
    .single();
  
  if (agency.status !== 'customer') {
    throw new Error('Agency must be a customer to award reward');
  }
  
  // 3. Create reward record
  const { data: reward } = await supabaseAdmin
    .from('evangelist_rewards')
    .insert({
      user_id: lead.submitting_user_id,
      agency_id: agencyId,
      lead_id: leadId,
      reward_description: '$1000 Team Wellness Budget',
      reward_amount_usd: 1000.00,
      status: 'approved',
      approved_by_admin_id: adminId,
      approved_at: new Date(),
    })
    .select()
    .single();
  
  // 4. Notify evangelist
  await supabaseAdmin.from('notifications').insert({
    user_id: lead.submitting_user_id,
    type: 'evangelist_reward',
    title: 'Congratulations! Your reward has been approved!',
    message: 'Your $1000 Team Wellness Budget has been approved. Check your dashboard for payment details.',
  });
  
  return reward;
}
```

---

## 📈 Analytics Queries

### Query 1: Community Health Metrics
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN user_id END) as wau,
  COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '1 day' THEN user_id END) as dau,
  COUNT(*) FILTER (WHERE TG_TABLE_NAME = 'posts') as posts_created,
  COUNT(*) FILTER (WHERE TG_TABLE_NAME = 'comments') as comments_created,
  COUNT(*) FILTER (WHERE is_anonymous = TRUE) as anonymous_content
FROM (
  SELECT created_at, author_id as user_id, is_anonymous, 'posts' as TG_TABLE_NAME FROM posts
  UNION ALL
  SELECT created_at, author_id as user_id, is_anonymous, 'comments' as TG_TABLE_NAME FROM comments
) combined
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Query 2: Sales Pipeline Value
```sql
SELECT 
  status,
  COUNT(*) as agency_count,
  SUM(estimated_annual_value) as total_potential_arr,
  AVG(avg_census) as avg_census_size
FROM agencies
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'customer' THEN 1
    WHEN 'negotiation' THEN 2
    WHEN 'demo_scheduled' THEN 3
    WHEN 'contacted' THEN 4
    WHEN 'lead' THEN 5
    WHEN 'prospect' THEN 6
  END;
```

### Query 3: Evangelist ROI
```sql
SELECT 
  COUNT(DISTINCT er.user_id) as total_evangelists,
  COUNT(DISTINCT er.agency_id) as agencies_closed,
  SUM(er.reward_amount_usd) as total_rewards_paid,
  SUM(a.estimated_annual_value) as total_arr_generated,
  SUM(a.estimated_annual_value) / NULLIF(SUM(er.reward_amount_usd), 0) as roi_multiple
FROM evangelist_rewards er
JOIN agencies a ON er.agency_id = a.id
WHERE er.status = 'paid'
  AND a.status = 'customer';
```

---

## 🔄 Maintenance Operations

### Daily Tasks
```sql
-- 1. Refresh hot posts view
REFRESH MATERIALIZED VIEW CONCURRENTLY hot_posts;

-- 2. Update daily stats
INSERT INTO daily_community_stats (date, total_users, new_users, ...)
SELECT 
  CURRENT_DATE,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as new_users,
  -- ... other metrics
FROM users;

-- 3. Clean up expired sessions
DELETE FROM auth_sessions WHERE expires_at < NOW();

-- 4. Clean up expired verification tokens
DELETE FROM auth_verification_tokens WHERE expires_at < NOW();
```

### Weekly Tasks
```sql
-- 1. Identify inactive communities
SELECT 
  c.id,
  c.name,
  c.member_count,
  MAX(p.created_at) as last_post_at,
  COUNT(p.id) FILTER (WHERE p.created_at > NOW() - INTERVAL '7 days') as posts_this_week
FROM communities c
LEFT JOIN posts p ON c.id = p.community_id
GROUP BY c.id, c.name, c.member_count
HAVING COUNT(p.id) FILTER (WHERE p.created_at > NOW() - INTERVAL '7 days') = 0
ORDER BY c.member_count DESC;

-- 2. Update active member counts
UPDATE communities c
SET active_member_count = (
  SELECT COUNT(DISTINCT m.user_id)
  FROM memberships m
  WHERE m.community_id = c.id
    AND m.last_active_at > NOW() - INTERVAL '30 days'
);
```

---

## 🚨 Troubleshooting

### Issue 1: RLS Blocking Legitimate Access
**Symptom:** User can't see their own content

**Solution:**
```sql
-- Check if user record exists
SELECT * FROM users WHERE auth_user_id = 'user-auth-id';

-- Verify RLS policy
EXPLAIN (ANALYZE, VERBOSE) 
SELECT * FROM posts WHERE author_id = 'user-id';
```

### Issue 2: Slow Post Loading
**Symptom:** Feed takes >2 seconds to load

**Solution:**
```sql
-- Check if indexes exist
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename = 'posts';

-- Refresh hot_posts view
REFRESH MATERIALIZED VIEW CONCURRENTLY hot_posts;

-- Check query plan
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM posts 
ORDER BY created_at DESC 
LIMIT 20;
```

### Issue 3: Evangelist Rewards Not Appearing
**Symptom:** User can't see their approved reward

**Solution:**
```sql
-- Verify reward exists
SELECT * FROM evangelist_rewards WHERE user_id = 'user-id';

-- Check RLS policy
SET ROLE authenticated;
SET request.jwt.claims.sub = 'auth-user-id';
SELECT * FROM evangelist_rewards;
RESET ROLE;
```

---

## 📚 Additional Resources

### Database Schema Tools
- **Visual ERD:** Use [dbdiagram.io](https://dbdiagram.io) or Supabase Studio
- **Schema Migrations:** Set up migration scripts for version control
- **Backup Strategy:** Enable Supabase daily backups

### Better Auth Documentation
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Next.js Integration Guide](https://www.better-auth.com/docs/integrations/next-js)
- [Database Schema Reference](https://www.better-auth.com/docs/concepts/database)

### Supabase Resources
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Performance Optimization](https://supabase.com/docs/guides/database/performance)
- [Triggers & Functions](https://supabase.com/docs/guides/database/functions)

---

## 🎯 Next Steps

1. **Execute Schema:** Run `complete_schema.sql` in Supabase SQL Editor
2. **Configure Better Auth:** Set up auth configuration and endpoints
3. **Test Core Flows:** User signup, post creation, DM sending
4. **Build Admin Dashboard:** Create admin interface for CRM operations
5. **Set Up Analytics:** Implement tracking and reporting
6. **Deploy to Production:** Launch with proper monitoring

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Nov 2025 | Complete production schema with Better Auth |
| 1.1 | Nov 2025 | Added strategic features |
| 1.0 | Nov 2025 | Initial community schema |

---

**Status:** ✅ Production Ready  
**Last Reviewed:** November 2025  
**Maintained By:** 10xR Engineering Team