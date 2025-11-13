/**
 * Save Button Component for Server Actions
 *
 * A specialized submit button for save operations that responds to pending states
 * from Next.js Server Actions using the useFormStatus hook.
 *
 * Similar to SubmitButton but with save-specific labeling.
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
 *   <textarea name="description" />
 *   <SaveButton />
 * </form>
 * ```
 */

'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SaveButtonProps {
  /**
   * Button text to display when not in pending state
   * @default "Save"
   */
  text?: string;

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
 * SaveButton Component
 *
 * Automatically detects form submission state and shows loading indicator.
 * Must be used inside a form element.
 *
 * @param text - Text to display when idle (default: "Save")
 * @param variant - Button style variant
 * @param className - Additional CSS classes
 */
export function SaveButton({
  text = 'Save',
  variant = 'default',
  className,
}: SaveButtonProps) {
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
          Saving...
        </>
      ) : (
        text
      )}
    </Button>
  );
}
