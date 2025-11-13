/**
 * User Search Dialog Component
 *
 * Modal dialog for searching and selecting users to start a chat with.
 * Features real-time search with debouncing.
 *
 * Features:
 * - Search users by username
 * - Debounced search input
 * - Click to start chat
 * - Loading states
 * - Empty states
 *
 * Stack:
 * - Next.js Client Component
 * - Shadcn UI Dialog
 * - Supabase for search
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createOrGetChatRoom } from '@/app/actions';
import { toast } from 'sonner';

/**
 * User type for search results
 */
type User = {
  id: string;
  username: string;
  avatar_url: string | null;
};

/**
 * UserSearchDialog Component
 *
 * Displays a button that opens a dialog for searching users.
 */
export default function UserSearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // ============================================================================
  // Debounced Search
  // ============================================================================
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from('users')
          .select('id, username, avatar_url')
          .ilike('username', `%${searchQuery}%`)
          .limit(10);

        if (error) {
          console.error('Error searching users:', error);
          toast.error('Failed to search users');
        } else {
          setUsers(data || []);
        }

        setIsLoading(false);
      } else {
        setUsers([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // ============================================================================
  // Handle User Selection
  // ============================================================================
  const handleSelectUser = async (userId: string) => {
    try {
      setIsCreatingRoom(true);

      // Create or get existing chat room
      const result = await createOrGetChatRoom(userId);

      // Navigate to the chat room
      router.push(`/chat/${result.roomId}`);

      // Close dialog
      setOpen(false);

      // Reset state
      setSearchQuery('');
      setUsers([]);
    } catch (error: any) {
      console.error('Error creating chat room:', error);
      toast.error(error.message || 'Failed to start chat');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-x-2">
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a Conversation</DialogTitle>
          <DialogDescription>
            Search for healthcare professionals to message
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="flex items-center gap-x-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={isCreatingRoom}
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-4 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length > 0 ? (
            <div className="flex flex-col gap-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  disabled={isCreatingRoom}
                  className="flex items-center gap-x-3 p-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Avatar */}
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Username */}
                  <span className="font-medium text-left">
                    {user.username}
                  </span>

                  {isCreatingRoom && (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                  )}
                </button>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Start typing to search for users
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
