/**
 * Community Description Form Component
 *
 * A client-side form that allows community creators to edit the description.
 * Uses Next.js Server Actions for secure, server-side updates.
 *
 * Features:
 * - Server Actions for secure mutations
 * - useFormState for reactive state management
 * - Toast notifications for feedback
 * - Textarea with character limits
 * - Loading states with spinner
 *
 * Stack:
 * - React client component
 * - Next.js Server Actions
 * - Shadcn UI Textarea
 * - Sonner for toast notifications
 */

'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { SaveButton } from './save-button';
import { updateSubDescription, type ActionResponse } from '@/app/actions';
import { toast } from 'sonner';

interface SubDescriptionFormProps {
  slug: string;
  description: string | null;
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
 * SubDescriptionForm Component
 *
 * Allows community creators to edit the community description.
 * Only visible to the creator of the community.
 *
 * @param slug - Community slug for identification
 * @param description - Current description text
 */
export function SubDescriptionForm({ slug, description }: SubDescriptionFormProps) {
  // ============================================================================
  // Form State Management with Server Actions
  // ============================================================================
  // useFormState hook binds the server action to the form
  const [state, formAction] = useFormState(updateSubDescription, initialState);

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
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-y-3">
      {/* Hidden field with community slug */}
      <input type="hidden" name="slug" value={slug} />

      {/* Description Textarea */}
      <Textarea
        name="description"
        placeholder="Describe your community..."
        defaultValue={description ?? ''}
        rows={4}
        maxLength={500}
        className="resize-none"
      />

      {/* Character count */}
      <p className="text-xs text-muted-foreground">
        {description?.length ?? 0} / 500 characters
      </p>

      {/* Show validation errors from server action */}
      {state.status === 'error' && state.message && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}

      {/* Save Button */}
      <SaveButton text="Save Changes" />
    </form>
  );
}
