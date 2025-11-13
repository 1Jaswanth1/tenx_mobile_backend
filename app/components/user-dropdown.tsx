/**
 * User Dropdown Component for 10xR Community Platform
 *
 * A client-side dropdown menu for authenticated users with:
 * - User avatar display
 * - Profile and settings links
 * - Create community link
 * - Logout functionality
 *
 * This component uses Shadcn UI dropdown components and integrates
 * with BetterAuth for logout functionality.
 */

'use client';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/lib/auth/auth-client';
import { useState } from 'react';

interface UserDropdownProps {
  userImage?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}

/**
 * UserDropdown Component
 *
 * Displays a dropdown menu with user profile options and logout functionality.
 * The avatar image falls back to a default icon if no user image is provided.
 *
 * @param userImage - URL of the user's avatar image
 * @param userName - Display name of the user
 * @param userEmail - Email address of the user
 */
export function UserDropdown({ userImage, userName, userEmail }: UserDropdownProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Handle logout with loading state
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      // Redirect will be handled by middleware
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full"
          aria-label="User menu"
        >
          {userImage ? (
            <img
              src={userImage}
              alt={userName ?? 'User avatar'}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User Info Header */}
        {(userName || userEmail) && (
          <>
            <div className="px-2 py-2">
              <p className="text-sm font-medium truncate">{userName || 'User'}</p>
              {userEmail && (
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Create Community */}
        <DropdownMenuItem asChild>
          <Link href="/r/create" className="flex items-center cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            <span>Create Community</span>
          </Link>
        </DropdownMenuItem>

        {/* Profile */}
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
