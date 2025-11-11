-- ============================================================================
-- FILE: supabase/schemas/auth.sql
-- SECTION: Better Auth Tables (Authentication Layer)
-- 
-- This file contains all Better Auth related tables.
-- Using declarative schema allows us to maintain auth structure in one place.
-- ============================================================================

-- Extensions required for auth
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- Better Auth: Core User Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_auth_users_email ON auth_users(email);

-- ============================================================================
-- Better Auth: Sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_token ON auth_sessions(token);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at);

-- ============================================================================
-- Better Auth: Accounts (OAuth & Multi-Provider)
-- ============================================================================
CREATE TABLE IF NOT EXISTS auth_accounts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  password TEXT, -- Hashed password for email/password auth
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_provider_account UNIQUE (provider, account_id)
);

CREATE INDEX idx_auth_accounts_user_id ON auth_accounts(user_id);
CREATE INDEX idx_auth_accounts_provider ON auth_accounts(provider, account_id);

-- ============================================================================
-- Better Auth: Verification Tokens
-- ============================================================================
CREATE TABLE IF NOT EXISTS auth_verification_tokens (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL, -- email or user_id
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auth_verification_tokens_token ON auth_verification_tokens(token);
CREATE INDEX idx_auth_verification_tokens_identifier ON auth_verification_tokens(identifier);

-- ============================================================================
-- Better Auth: Two-Factor Authentication
-- ============================================================================
CREATE TABLE IF NOT EXISTS auth_two_factor (
  id TEXT PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[], -- Array of hashed backup codes
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
