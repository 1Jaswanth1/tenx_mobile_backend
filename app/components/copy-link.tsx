/**
 * Copy Link Component
 *
 * Allows users to copy the post URL to clipboard.
 * Shows visual feedback when link is copied.
 *
 * Features:
 * - One-click copy to clipboard
 * - Toast notification on success
 * - Icon button with hover states
 * - Full URL generation from post ID and community slug
 *
 * Stack:
 * - Next.js Client Component
 * - Clipboard API
 * - Sonner for toasts
 * - Lucide icons
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Check } from 'lucide-react';
import { toast } from 'sonner';

/**
 * CopyLink Props
 */
interface CopyLinkProps {
  /**
   * Full URL to copy to clipboard
   */
  url: string;
}

/**
 * CopyLink Component
 *
 * Displays a button that copies the post URL to clipboard.
 *
 * @param url - Full URL to copy
 */
export default function CopyLink({ url }: CopyLinkProps) {
  // ============================================================================
  // State for Copy Feedback
  // ============================================================================
  const [copied, setCopied] = useState(false);

  // ============================================================================
  // Copy Handler
  // ============================================================================
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!', {
        duration: 2000,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link. Please try again.', {
        duration: 3000,
      });
    }
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="gap-x-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-sm">Copied!</span>
        </>
      ) : (
        <>
          <LinkIcon className="h-4 w-4" />
          <span className="text-sm">Share</span>
        </>
      )}
    </Button>
  );
}
