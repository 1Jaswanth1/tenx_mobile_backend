/**
 * Pagination Component
 *
 * Handles page navigation for the homepage posts.
 * Uses client-side routing with Next.js router.
 *
 * Features:
 * - Previous/Next page buttons
 * - Current page indicator
 * - Disabled states for boundary pages
 * - URL query parameter-based navigation
 *
 * Stack:
 * - Next.js client component
 * - useRouter for navigation
 * - useSearchParams for current page
 * - Shadcn UI Button component
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination Props
 */
interface PaginationProps {
  /**
   * Total number of pages available
   */
  totalPages: number;
}

/**
 * Pagination Component
 *
 * Renders pagination controls for navigating between pages.
 *
 * @param totalPages - Total number of pages
 */
export default function Pagination({ totalPages }: PaginationProps) {
  // ============================================================================
  // Navigation Hooks
  // ============================================================================
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current page from URL query params (default to 1)
  const currentPage = Number(searchParams.get('page')) || 1;

  // ============================================================================
  // Navigation Handlers
  // ============================================================================
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      router.push(`/?page=${currentPage - 1}`);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      router.push(`/?page=${currentPage + 1}`);
    }
  };

  // ============================================================================
  // Don't render if there's only one page or no pages
  // ============================================================================
  if (totalPages <= 1) {
    return null;
  }

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div className="flex items-center justify-between mt-6 gap-x-4">
      {/* Previous Button */}
      <Button
        onClick={goToPreviousPage}
        disabled={currentPage <= 1}
        variant="outline"
        size="sm"
        className="gap-x-2"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Page Indicator */}
      <div className="flex items-center gap-x-2">
        <p className="text-sm text-muted-foreground">
          Page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
          <span className="font-medium text-foreground">{totalPages}</span>
        </p>
      </div>

      {/* Next Button */}
      <Button
        onClick={goToNextPage}
        disabled={currentPage >= totalPages}
        variant="outline"
        size="sm"
        className="gap-x-2"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
