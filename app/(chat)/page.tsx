/**
 * Chat List Page
 *
 * Displays all direct message conversations for the current user.
 * Shows conversation previews with last message and timestamp.
 *
 * Features:
 * - List of all user's chat rooms
 * - Last message preview
 * - Unread indicators
 * - Search/filter users
 * - "New Chat" button
 *
 * Stack:
 * - Next.js 16 Server Component
 * - Supabase for data queries
 * - BetterAuth for authentication
 */

import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth-server';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Plus, Search } from 'lucide-react';
import UserSearchDialog from '@/app/components/user-search-dialog';

/**
 * Data Fetching Function
 *
 * Fetches all chat rooms for the current user with last message info.
 */
async function getData() {
  // Disable caching for always-fresh data
  noStore();

  const session = await auth();
  const authUser = session?.user;

  if (!authUser) {
    return { rooms: [], userId: null };
  }

  const supabase = await createClient();

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();

  if (!userProfile) {
    return { rooms: [], userId: null };
  }

  // Get all chat rooms user is member of
  const { data: rooms, error } = await supabase
    .from('chat_room_member')
    .select(
      `
      chat_room_id,
      last_read_at,
      chat_room:chat_room!inner (
        id,
        name,
        created_at,
        updated_at
      )
    `
    )
    .eq('member_id', userProfile.id)
    .order('chat_room(updated_at)', { ascending: false });

  if (error) {
    console.error('Error fetching chat rooms:', error);
    return { rooms: [], userId: userProfile.id };
  }

  // For each room, get the other member and last message
  const roomsWithDetails = await Promise.all(
    (rooms || []).map(async (room: any) => {
      // Get other member
      const { data: otherMember } = await supabase
        .from('chat_room_member')
        .select(
          `
          member_id,
          users!chat_room_member_member_id_fkey (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('chat_room_id', room.chat_room_id)
        .neq('member_id', userProfile.id)
        .single();

      // Get last message
      const { data: lastMessage } = await supabase
        .from('message')
        .select('text, created_at, author_id')
        .eq('chat_room_id', room.chat_room_id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Calculate unread count
      const { data: unreadCount } = await supabase.rpc('get_unread_count', {
        p_user_id: userProfile.id,
        p_room_id: room.chat_room_id,
      });

      return {
        ...room,
        otherUser: otherMember?.users,
        lastMessage,
        unreadCount: unreadCount || 0,
      };
    })
  );

  return {
    rooms: roomsWithDetails,
    userId: userProfile.id,
  };
}

/**
 * ChatList Page Component
 */
export default async function ChatListPage() {
  const { rooms, userId } = await getData();

  // ============================================================================
  // Format Timestamp
  // ============================================================================
  const formatTime = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div className="max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-x-3">
          <MessageSquare className="h-8 w-8 text-brand-orange" />
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>

        {/* New Chat Button */}
        <UserSearchDialog />
      </div>

      <Separator className="mb-6" />

      {/* Chat List */}
      {rooms && rooms.length > 0 ? (
        <div className="flex flex-col gap-y-2">
          {rooms.map((room: any) => (
            <Link
              key={room.chat_room_id}
              href={`/chat/${room.chat_room_id}`}
              className="block"
            >
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {room.otherUser?.avatar_url ? (
                        <img
                          src={room.otherUser.avatar_url}
                          alt={room.otherUser.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-lg font-semibold">
                            {room.otherUser?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">
                          {room.otherUser?.username || 'Unknown User'}
                        </h3>
                        {room.lastMessage && (
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {formatTime(room.lastMessage.created_at)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {room.lastMessage
                            ? `${room.lastMessage.author_id === userId ? 'You: ' : ''}${room.lastMessage.text.substring(0, 50)}${room.lastMessage.text.length > 50 ? '...' : ''}`
                            : 'No messages yet'}
                        </p>

                        {/* Unread Badge */}
                        {room.unreadCount > 0 && (
                          <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-brand-orange rounded-full">
                            {room.unreadCount > 9 ? '9+' : room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start a conversation by searching for healthcare professionals to
              connect with.
            </p>
            <UserSearchDialog />
          </div>
        </Card>
      )}
    </div>
  );
}
