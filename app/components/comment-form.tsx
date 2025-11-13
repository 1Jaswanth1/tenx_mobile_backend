/**
 * Comment Form Component
 *
 * Allows authenticated users to post comments on posts.
 * Uses server actions for secure comment creation.
 *
 * Features:
 * - Textarea for comment input
 * - Character limit display
 * - Form reset after successful submission
 * - Toast notifications for feedback
 * - Loading states during submission
 *
 * Stack:
 * - Next.js Client Component
 * - Server Actions for mutations
 * - Shadcn UI components
 * - Sonner for toasts
 */

'use client';

import { useRef, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { SubmitButton } from '@/app/components/submit-button';
import { createComment, type ActionResponse } from '@/app/actions';
import { toast } from 'sonner';

/**
 * CommentForm Props
 */
interface CommentFormProps {
  /**
   * ID of the post to comment on
   */
  postId: string;
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
 * CommentForm Component
 *
 * Displays a form for creating comments on posts.
 * Only visible to authenticated users.
 *
 * @param postId - ID of the post to comment on
 */
export default function CommentForm({ postId }: CommentFormProps) {
  // ============================================================================
  // Form References and State
  // ============================================================================
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(createComment, initialState);

  // ============================================================================
  // Toast Notifications based on Server Action Response
  // ============================================================================
  useEffect(() => {
    if (state.message) {
      if (state.status === 'success') {
        toast.success(state.message, {
          duration: 3000,
        });
        // Reset form after successful submission
        formRef.current?.reset();
      } else if (state.status === 'error') {
        toast.error(state.message, {
          duration: 4000,
        });
      }
    }
  }, [state]);

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-y-3 p-4 border rounded-md bg-card"
    >
      {/* Hidden field with post ID */}
      <input type="hidden" name="postId" value={postId} />

      {/* Comment Textarea */}
      <Textarea
        name="comment"
        placeholder="What are your thoughts?"
        required
        maxLength={10000}
        rows={4}
        className="resize-none"
      />

      {/* Character limit hint */}
      <p className="text-xs text-muted-foreground">Max 10,000 characters</p>

      {/* Error Display */}
      {state.status === 'error' && state.message && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <SubmitButton label="Comment" pendingLabel="Posting..." />
      </div>
    </form>
  );
}
