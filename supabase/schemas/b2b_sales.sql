-- ============================================================================
-- FILE: supabase/schemas/b2b_sales.sql
-- SECTION: B2B Sales Engine (THE "PAYLOAD")
-- 
-- ** CRITICAL: ALL TABLES IN THIS SECTION ARE ADMIN-ONLY **
-- These tables power the $10M ARR growth strategy
-- ============================================================================

-- ============================================================================
-- Agencies (B2B CRM / Target List)
-- ============================================================================
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Agency Identity
  name TEXT NOT NULL,
  legal_name TEXT,
  npi_number TEXT UNIQUE, -- National Provider Identifier
  tax_id TEXT,
  
  -- Contact Information
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  county TEXT,
  website TEXT,
  main_phone TEXT,
  main_email TEXT,
  
  -- Primary Contact (Decision Maker)
  primary_contact_name TEXT,
  primary_contact_title TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  
  -- Sales Pipeline Status
  status agency_status DEFAULT 'prospect',
  
  -- Revenue Potential
  avg_census INTEGER DEFAULT 0,
  estimated_annual_value NUMERIC(10, 2), -- Auto-calculated
  
  -- Sales Process Tracking
  lead_source TEXT,
  assigned_sales_rep TEXT,
  demo_scheduled_at TIMESTAMP WITH TIME ZONE,
  contract_sent_at TIMESTAMP WITH TIME ZONE,
  contract_signed_at TIMESTAMP WITH TIME ZONE,
  
  -- Admin Notes (Internal CRM)
  sales_notes TEXT,
  internal_tags TEXT[],
  
  -- Customer Data (if status = 'customer')
  customer_since TIMESTAMP WITH TIME ZONE,
  monthly_recurring_revenue NUMERIC(10, 2),
  contract_end_date DATE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 200)
);

CREATE INDEX idx_agencies_name ON agencies(name);
CREATE INDEX idx_agencies_status ON agencies(status);
CREATE INDEX idx_agencies_npi ON agencies(npi_number) WHERE npi_number IS NOT NULL;
CREATE INDEX idx_agencies_state ON agencies(state);
CREATE INDEX idx_agencies_estimated_value ON agencies(estimated_annual_value DESC);

-- ============================================================================
-- Aide Profiles (THE BRIDGE)
-- ============================================================================
-- ** THIS IS THE MOST CRITICAL TABLE **
-- Links anonymous 'users.id' to real-world 'agencies.id'
CREATE TABLE aide_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- [THE BRIDGE] Links anonymous user to real-world identity
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  
  -- Professional Identity (PRIVATE)
  real_name TEXT,
  professional_email TEXT,
  professional_phone TEXT,
  role professional_role,
  
  -- Verification & Trust
  verification_status verification_status DEFAULT 'unverified',
  verification_method TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- [STRATEGIC: Data Bomb] Experience data
  years_of_experience INTEGER,
  license_number TEXT,
  license_state TEXT,
  
  -- [STRATEGIC: Evangelist Army] Activation switch
  is_evangelist BOOLEAN DEFAULT FALSE,
  evangelist_activated_at TIMESTAMP WITH TIME ZONE,
  evangelist_activated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  evangelist_notes TEXT,
  
  -- Contact Preferences
  preferred_contact_method TEXT,
  contact_availability TEXT,
  
  -- Privacy Settings
  allow_agency_verification BOOLEAN DEFAULT TRUE,
  allow_data_aggregation BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT years_experience_range CHECK (years_of_experience >= 0 AND years_of_experience <= 70)
);

CREATE INDEX idx_aide_profiles_user_id ON aide_profiles(user_id);
CREATE INDEX idx_aide_profiles_agency_id ON aide_profiles(agency_id);
CREATE INDEX idx_aide_profiles_role ON aide_profiles(role);
CREATE INDEX idx_aide_profiles_verification_status ON aide_profiles(verification_status);
CREATE INDEX idx_aide_profiles_is_evangelist ON aide_profiles(is_evangelist) WHERE is_evangelist = TRUE;

-- ============================================================================
-- Agency Leads (Inbound Funnel)
-- ============================================================================
CREATE TABLE agency_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Submitter
  submitting_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Raw Form Data
  agency_name_raw TEXT NOT NULL,
  don_name_raw TEXT,
  don_email_raw TEXT,
  don_phone_raw TEXT,
  agency_size_estimate TEXT,
  user_notes TEXT,
  
  -- Lead Processing
  status lead_status DEFAULT 'new',
  
  -- Admin Assignment
  processed_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- CRM Linkage
  linked_agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  
  -- Admin Notes
  admin_notes TEXT,
  follow_up_date DATE,
  
  -- Conversion Tracking
  converted_to_customer BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT agency_name_length CHECK (char_length(agency_name_raw) >= 2 AND char_length(agency_name_raw) <= 200)
);

CREATE INDEX idx_agency_leads_status ON agency_leads(status, created_at DESC);
CREATE INDEX idx_agency_leads_submitter ON agency_leads(submitting_user_id);
CREATE INDEX idx_agency_leads_linked_agency ON agency_leads(linked_agency_id);

-- ============================================================================
-- Evangelist Rewards ($1K Wellness Budget Tracker)
-- ============================================================================
CREATE TABLE evangelist_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- The Evangelist
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- The Closed Deal
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES agency_leads(id) ON DELETE SET NULL,
  
  -- Reward Details
  reward_description TEXT DEFAULT '$1000 Team Wellness Budget',
  reward_amount_usd NUMERIC(10, 2) DEFAULT 1000.00,
  
  -- Status Tracking
  status reward_status DEFAULT 'pending',
  
  -- Admin Approval Process
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  payment_reference TEXT,
  
  -- Notes
  admin_notes TEXT,
  user_notes TEXT,
  
  -- Denial/Cancellation
  denied_reason TEXT,
  cancelled_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_evangelist_rewards_user_id ON evangelist_rewards(user_id, created_at DESC);
CREATE INDEX idx_evangelist_rewards_agency_id ON evangelist_rewards(agency_id);
CREATE INDEX idx_evangelist_rewards_status ON evangelist_rewards(status);
CREATE INDEX idx_evangelist_rewards_lead_id ON evangelist_rewards(lead_id);

-- ============================================================================
-- Sales Activities (CRM Activity Log)
-- ============================================================================
CREATE TABLE sales_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Related Agency
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  
  -- Activity Details
  activity_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  outcome TEXT,
  
  -- Admin Who Logged It
  logged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Next Steps
  next_action TEXT,
  next_action_due_date DATE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT subject_length CHECK (char_length(subject) >= 3 AND char_length(subject) <= 200)
);

CREATE INDEX idx_sales_activities_agency ON sales_activities(agency_id, created_at DESC);
CREATE INDEX idx_sales_activities_scheduled ON sales_activities(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_sales_activities_logged_by ON sales_activities(logged_by);
