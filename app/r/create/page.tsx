/**
 * Create Community Page for 10xR Community Platform
 *
 * Allows authenticated users to create new communities (similar to subreddits).
 * Uses Next.js Server Actions for secure, server-side community creation.
 *
 * Features:
 * - Server Actions for secure mutations
 * - useFormState for reactive state management
 * - Toast notifications for feedback
 * - Automatic slug generation from community name
 * - r/ prefix visualization
 * - Redirect to new community on success
 *
 * Stack:
 * - React client component
 * - Next.js Server Actions
 * - Shadcn UI components
 * - Sonner for toast notifications
 */

'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SubmitButton } from '@/app/components/submit-button';
import { createCommunity, type ActionResponse } from '@/app/actions';
import { toast } from 'sonner';
import Link from 'next/link';

/**
 * Initial state for the form
 * Used by useFormState hook
 */
const initialState: ActionResponse = {
  status: 'info',
  message: '',
};

/**
 * Create Community Page Component
 *
 * Renders a form for creating new communities with:
 * - Community name input with r/ prefix
 * - Real-time validation feedback
 * - Toast notifications on errors
 * - Redirect on success
 */
export default function CreateCommunityPage() {
  // ============================================================================
  // Form State Management with Server Actions
  // ============================================================================
  // useFormState hook binds the server action to the form
  const [state, formAction] = useFormState(createCommunity, initialState);

  // ============================================================================
  // Toast Notifications based on Server Action Response
  // ============================================================================
  useEffect(() => {
    // Show toast notifications when server action completes with an error
    // (Success redirects to the new community, so no toast needed)
    if (state.message && state.status === 'error') {
      toast.error(state.message, {
        duration: 4000,
      });
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 pt-12">
        {/* ========================================================================
            Page Header
            ======================================================================== */}
        <div>
          <h1 className="text-3xl font-semibold">Create a Community</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Build and grow a community about something you care about. We'll help you set it up.
          </p>
          <Separator className="my-6" />
        </div>

        {/* ========================================================================
            Community Creation Form
            ======================================================================== */}
        <form action={formAction} className="flex flex-col gap-6">
          {/* Community Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <p className="text-sm text-muted-foreground">
              Community names including capitalization cannot be changed.
              Choose wisely!
            </p>

            {/* Input with r/ prefix */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                r/
              </span>
              <Input
                id="name"
                name="name"
                type="text"
                required
                minLength={3}
                maxLength={50}
                className="pl-8"
                placeholder="community-name"
                aria-describedby="name-description"
              />
            </div>

            {/* Show validation errors from server action */}
            {state.status === 'error' && state.message && (
              <p className="text-sm text-destructive" role="alert">
                {state.message}
              </p>
            )}

            {/* Helper text */}
            <p id="name-description" className="text-xs text-muted-foreground">
              3-50 characters. Letters, numbers, spaces, and hyphens are allowed.
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg border border-muted bg-muted/50 p-4">
            <h3 className="text-sm font-medium mb-2">Community Guidelines</h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Choose a name that reflects your community's purpose</li>
              <li>Keep it memorable and easy to type</li>
              <li>Avoid offensive or misleading names</li>
              <li>Names are permanent once created</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4">
            {/* Cancel Button */}
            <Button asChild variant="outline">
              <Link href="/">Cancel</Link>
            </Button>

            {/* Submit Button with Pending State */}
            <SubmitButton
              label="Create Community"
              pendingLabel="Creating..."
              variant="default"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Metadata for the Create Community Page
 */
export const metadata = {
  title: 'Create Community | 10xR',
  description: 'Create a new community on 10xR',
};
