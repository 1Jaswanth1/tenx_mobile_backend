// app/dashboard/page.tsx
// Dashboard Page - Protected Route
//
// This is a protected page that requires authentication.
// It demonstrates the authentication flow and session management.

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authClient, useCurrentUser, useAuthStatus, AuthStatus } from '@/lib/auth/auth-client';
import { Icons } from '@/components/ui/icons';
import { useState } from 'react';

/**
 * Dashboard Page Component
 *
 * Features:
 * - Display user information
 * - Logout functionality
 * - Protected route (requires authentication)
 * - Session state management
 */
export default function DashboardPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const authStatus = useAuthStatus();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      await authClient.signOut();

      // Redirect to home page after logout
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('Failed to log out. Please try again.');
      setIsLoggingOut(false);
    }
  };

  // Loading state
  if (authStatus === AuthStatus.LOADING) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (authStatus === AuthStatus.ERROR) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            An error occurred while loading your session. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Unauthenticated state (should be handled by middleware, but as fallback)
  if (authStatus === AuthStatus.UNAUTHENTICATED || !user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name || user.username || 'User'}!
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
            <CardDescription>
              View your account information and session details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* User ID */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-sm font-mono">{user.id}</p>
              </div>

              {/* Email */}
              {user.email && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{user.email}</p>
                </div>
              )}

              {/* Name */}
              {user.name && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{user.name}</p>
                </div>
              )}

              {/* Username */}
              {user.username && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Username</p>
                  <p className="text-sm">@{user.username}</p>
                </div>
              )}

              {/* Email Verified */}
              {user.emailVerified !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email Status</p>
                  <div className="flex items-center space-x-2">
                    {user.emailVerified ? (
                      <>
                        <Icons.check className="h-4 w-4 text-green-600" />
                        <p className="text-sm">Verified</p>
                      </>
                    ) : (
                      <>
                        <Icons.alertCircle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm">Not verified</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Account Status */}
              {user.isActive !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                  <div className="flex items-center space-x-2">
                    {user.isActive ? (
                      <>
                        <Icons.check className="h-4 w-4 text-green-600" />
                        <p className="text-sm">Active</p>
                      </>
                    ) : (
                      <>
                        <Icons.close className="h-4 w-4 text-red-600" />
                        <p className="text-sm">Inactive</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Karma */}
              {typeof user.karma === 'number' && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Karma</p>
                  <p className="text-sm">{user.karma} points</p>
                </div>
              )}

              {/* Created At */}
              {user.createdAt && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/settings')}>
              Edit Profile
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Log Out
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Links Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>
              Navigate to different sections of the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => router.push('/communities')}
            >
              <span className="font-semibold">Communities</span>
              <span className="text-xs text-muted-foreground">
                Explore and join communities
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => router.push('/profile')}
            >
              <span className="font-semibold">Profile</span>
              <span className="text-xs text-muted-foreground">
                View your public profile
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => router.push('/messages')}
            >
              <span className="font-semibold">Messages</span>
              <span className="text-xs text-muted-foreground">
                Check your direct messages
              </span>
            </Button>
          </CardContent>
        </Card>

        {/* Session Info Card (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <Card>
            <CardHeader>
              <CardTitle>Session Details (Dev Only)</CardTitle>
              <CardDescription>
                Debug information about your current session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-xs text-slate-50">
                {JSON.stringify(user, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
