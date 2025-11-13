/**
 * Submit Button Component for Server Actions
 *
 * A reusable submit button component that responds to pending states
 * from Next.js Server Actions using the useFormStatus hook.
 *
 * Features:
 * - Automatic pending state detection
 * - Loading spinner during submission
 * - Disabled state while pending
 * - Accessible with proper ARIA attributes
 *
 * Usage:
 * Place this button inside a <form> that uses a server action:
 * ```tsx
 * <form action={serverAction}>
 *   <input name="field" />
 *   <SubmitButton />
 * </form>
 * ```
 */

'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  /**
   * Button text to display when not in pending state
   * @default "Save Changes"
   */
  label?: string;

  /**
   * Button text to display when in pending state
   * @default "Saving..."
   */
  pendingLabel?: string;

  /**
   * Button variant from Shadcn UI
   * @default "default"
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SubmitButton Component
 *
 * Automatically detects form submission state and shows loading indicator.
 * Must be used inside a form element.
 *
 * @param label - Text to display when idle
 * @param pendingLabel - Text to display when submitting
 * @param variant - Button style variant
 * @param className - Additional CSS classes
 */
export function SubmitButton({
  label = 'Save Changes',
  pendingLabel = 'Saving...',
  variant = 'default',
  className,
}: SubmitButtonProps) {
  // Get the form submission status from React DOM
  // This hook must be used inside a component that's a child of a <form>
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      className={className}
      aria-busy={pending}
      aria-live="polite"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
