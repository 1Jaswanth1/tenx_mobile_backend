/**
 * Settings Page for 10xR Community Platform
 *
 * A secure, authenticated page where users can view and update their profile settings.
 * This page is protected - unauthenticated users are redirected to /login.
 *
 * Features:
 * - Session-based route protection using BetterAuth
 * - Server-side data fetching from Supabase
 * - Username editing with validation
 *
 * Stack:
 * - Next.js 16 App Router (Server Component)
 * - BetterAuth for authentication
 * - Supabase for database operations
 * - Shadcn UI components
 */

import { auth } from '@/lib/auth/auth-server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from '../components/settings-form';

/**
 * Settings Page Component
 *
 * Server component that:
 * 1. Verifies user authentication via BetterAuth
 * 2. Fetches user profile data from Supabase
 * 3. Renders the settings form with current data
 *
 * @returns JSX.Element - Settings page with form
 */
export default async function SettingsPage() {
  // ============================================================================
  // STEP 1: Session Protection
  // ============================================================================
  // Fetch the current user session using BetterAuth
  const session = await auth();
  const authUser = session?.user;

  // Redirect to login if no authenticated session exists
  if (!authUser) {
    return redirect('/login');
  }

  // ============================================================================
  // STEP 2: Fetch User Profile Data from Supabase
  // ============================================================================
  // Create Supabase client for server-side operations
  const supabase = await createClient();

  // Query the users table to get the user's profile
  // NOTE: The 'users' table has 'auth_user_id' that links to BetterAuth's user ID
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('id, username, display_name, bio, avatar_url, karma')
    .eq('auth_user_id', authUser.id)
    .single();

  // Handle database errors
  if (error) {
    console.error('Error fetching user profile:', error.message);
  }

  // Extract username with fallback
  const username = userProfile?.username ?? '';
  const userId = userProfile?.id ?? '';

  // ============================================================================
  // STEP 3: Render Settings Form
  // ============================================================================
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 pt-12">
        {/* Settings Form Component */}
        <SettingsForm
          username={username}
          userId={userId}
          authUserId={authUser.id}
        />
      </div>
    </div>
  );
}

/**
 * Metadata for the Settings Page
 */
export const metadata = {
  title: 'Settings | 10xR Community',
  description: 'Manage your account settings and preferences',
};
