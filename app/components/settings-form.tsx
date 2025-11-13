/**
 * Settings Form Component for 10xR Community Platform
 *
 * A client-side form component that uses Next.js Server Actions
 * to update user settings securely on the server.
 *
 * Features:
 * - Server Actions for secure mutations
 * - useFormState for reactive state management
 * - Toast notifications for feedback
 * - Client-side validation
 * - Pending states with loading indicators
 *
 * Stack:
 * - React client component
 * - Next.js Server Actions
 * - Shadcn UI components (Input, Label, Button, Separator)
 * - Sonner for toast notifications
 */

'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { SubmitButton } from './submit-button';
import { updateUsername, type ActionResponse } from '@/app/actions';
import { toast } from 'sonner';
import Link from 'next/link';

interface SettingsFormProps {
  username: string;
  userId: string;
  authUserId: string;
}

/**
 * Initial state for the form
 * Used by useFormState hook
 */
const initialState: ActionResponse = {
  status: 'info',
  message: '',
};

/**
 * SettingsForm Component
 *
 * Handles username updates using Server Actions with reactive UI.
 * Integrates with Next.js form state management and toast notifications.
 *
 * @param username - Current username from database
 * @param userId - User's ID in the users table
 * @param authUserId - User's ID in BetterAuth (auth_users table)
 */
export function SettingsForm({ username, userId, authUserId }: SettingsFormProps) {
  // ============================================================================
  // Form State Management with Server Actions
  // ============================================================================
  // useFormState hook binds the server action to the form
  // It provides the action response state and a wrapped action function
  const [state, formAction] = useFormState(updateUsername, initialState);

  // ============================================================================
  // Toast Notifications based on Server Action Response
  // ============================================================================
  useEffect(() => {
    // Show toast notifications when server action completes
    if (state.message) {
      if (state.status === 'success') {
        toast.success(state.message, {
          duration: 3000,
        });
      } else if (state.status === 'error') {
        toast.error(state.message, {
          duration: 4000,
        });
      } else if (state.status === 'info') {
        toast.info(state.message, {
          duration: 3000,
        });
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* ========================================================================
          Page Header
          ======================================================================== */}
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
        <Separator className="my-6" />
      </div>

      {/* ========================================================================
          Username Field
          ======================================================================== */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          Username
        </Label>
        <p className="text-sm text-muted-foreground">
          Choose a unique name that identifies you in the community.
          Must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens.
        </p>

        <Input
          id="username"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={20}
          defaultValue={username}
          placeholder="Enter your username"
          aria-describedby="username-description"
          className={state.status === 'error' ? 'border-destructive' : ''}
        />

        {/* Show validation errors from server action */}
        {state.status === 'error' && state.message && (
          <p className="text-sm text-destructive" role="alert">
            {state.message}
          </p>
        )}

        {/* Helper text */}
        <p id="username-description" className="text-xs text-muted-foreground">
          Your username will be visible to other community members.
        </p>
      </div>

      {/* ========================================================================
          Form Actions
          ======================================================================== */}
      <div className="flex items-center justify-end gap-4 pt-4">
        {/* Cancel Button */}
        <Link href="/">
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </Link>

        {/* Submit Button with Pending State */}
        <SubmitButton
          label="Save Changes"
          pendingLabel="Saving..."
          variant="default"
        />
      </div>

      {/* ========================================================================
          Success Message (Optional)
          ======================================================================== */}
      {state.status === 'success' && (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            {state.message}
          </p>
        </div>
      )}
    </form>
  );
}
