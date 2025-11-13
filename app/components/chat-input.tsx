/**
 * Chat Input Component
 *
 * Form for sending messages in a chat room.
 * Handles message submission with optimistic updates.
 *
 * Features:
 * - Textarea input with Enter to send
 * - Form validation
 * - Loading states
 * - Auto-focus
 * - Character limit
 *
 * Stack:
 * - Next.js Client Component
 * - Server Actions
 */

'use client';

import { useRef, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { sendMessage } from '@/app/actions';
import { toast } from 'sonner';

/**
 * Initial form state
 */
const initialState = {
  status: 'idle' as 'idle' | 'success' | 'error',
  message: '',
};

/**
 * ChatInput Component Props
 */
interface ChatInputProps {
  roomId: string;
}

/**
 * ChatInput Component
 *
 * Form for composing and sending chat messages.
 */
export default function ChatInput({ roomId }: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [state, formAction] = useFormState(sendMessage, initialState);

  // ============================================================================
  // Handle Form Success/Error
  // ============================================================================
  useEffect(() => {
    if (state.status === 'success') {
      // Reset form
      formRef.current?.reset();

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // Show success toast (optional)
      // toast.success('Message sent');
    }

    if (state.status === 'error') {
      toast.error(state.message || 'Failed to send message');
    }
  }, [state]);

  // ============================================================================
  // Handle Keyboard Shortcuts
  // ============================================================================
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  // ============================================================================
  // Auto-resize Textarea
  // ============================================================================
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-x-2">
      <input type="hidden" name="roomId" value={roomId} />

      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          name="message"
          placeholder="Type a message..."
          maxLength={5000}
          rows={1}
          required
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          className="min-h-[44px] max-h-[150px] resize-none"
          autoFocus
        />
      </div>

      <Button
        type="submit"
        size="icon"
        className="h-[44px] w-[44px] flex-shrink-0"
        disabled={state.status === 'idle' && false} // Can add pending state here
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
