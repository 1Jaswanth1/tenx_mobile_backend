/**
 * Chat Layout Component
 *
 * Wraps all chat-related pages with authentication protection.
 * Provides a two-column responsive layout for chat functionality.
 *
 * Features:
 * - BetterAuth session validation
 * - Redirects unauthenticated users to login
 * - Two-column layout (conversations list + active chat)
 * - Responsive mobile behavior
 *
 * Stack:
 * - Next.js 16 Server Component
 * - BetterAuth for authentication
 * - Responsive Tailwind CSS
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth-server';
import { Metadata } from 'next';

/**
 * Page Metadata
 */
export const metadata: Metadata = {
  title: 'Messages - 10xR Community',
  description: 'Direct messages and conversations with healthcare professionals',
};

/**
 * ChatLayout Component
 *
 * Protected layout for chat routes with authentication check.
 *
 * @param children - Child pages (chat list or chat room)
 */
export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ============================================================================
  // Authentication Check
  // ============================================================================
  // Fetch the current user session using BetterAuth
  const session = await auth();
  const user = session?.user;

  // Redirect to login if no authenticated session exists
  if (!user) {
    return redirect('/login');
  }

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}
