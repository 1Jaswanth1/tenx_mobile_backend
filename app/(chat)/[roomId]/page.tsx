/**
 * Chat Room Page
 *
 * Displays a 1-on-1 chat conversation with real-time messaging.
 * Shows message history and allows sending new messages.
 *
 * Features:
 * - Real-time message updates via Supabase Realtime
 * - Message history with timestamps
 * - User avatars and names
 * - Auto-scroll to bottom
 * - Message input with send button
 *
 * Stack:
 * - Next.js 16 Server Component (data fetching)
 * - Client Components for real-time features
 * - Supabase Realtime
 */

import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth-server';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ChatMessages from '@/app/components/chat-messages';
import ChatInput from '@/app/components/chat-input';

/**
 * Data Fetching Function
 *
 * Fetches chat room details, messages, and participants.
 */
async function getData(roomId: string, userId: string) {
  noStore();

  const supabase = await createClient();

  // Verify user is a member of this room
  const { data: membership, error: membershipError } = await supabase
    .from('chat_room_member')
    .select('chat_room_id')
    .eq('chat_room_id', roomId)
    .eq('member_id', userId)
    .single();

  if (membershipError || !membership) {
    return null;
  }

  // Get room details
  const { data: room, error: roomError } = await supabase
    .from('chat_room')
    .select('id, name, is_direct, created_at')
    .eq('id', roomId)
    .single();

  if (roomError || !room) {
    return null;
  }

  // Get other participant
  const { data: otherMember, error: otherError } = await supabase
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
    .eq('chat_room_id', roomId)
    .neq('member_id', userId)
    .single();

  if (otherError) {
    console.error('Error fetching other member:', otherError);
  }

  // Get messages
  const { data: messages, error: messagesError } = await supabase
    .from('message')
    .select(
      `
      id,
      text,
      created_at,
      is_edited,
      is_deleted,
      author_id,
      users!message_author_id_fkey (
        id,
        username,
        avatar_url
      )
    `
    )
    .eq('chat_room_id', roomId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
  }

  // Update last_read_at for this user
  await supabase
    .from('chat_room_member')
    .update({ last_read_at: new Date().toISOString() })
    .eq('chat_room_id', roomId)
    .eq('member_id', userId);

  return {
    room,
    otherUser: otherMember?.users,
    messages: messages || [],
  };
}

/**
 * Chat Room Page Component
 */
export default async function ChatRoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  // ============================================================================
  // Get Current User
  // ============================================================================
  const session = await auth();
  const authUser = session?.user;

  if (!authUser) {
    return notFound();
  }

  const supabase = await createClient();
  const { data: userProfile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();

  if (!userProfile) {
    return notFound();
  }

  // ============================================================================
  // Fetch Data
  // ============================================================================
  const data = await getData(params.roomId, userProfile.id);

  if (!data) {
    return notFound();
  }

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div className="max-w-[1000px] mx-auto h-[calc(100vh-8rem)]">
      <Card className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-x-4">
            {/* Back Button */}
            <Link href="/chat" className="lg:hidden">
              <ArrowLeft className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Link>

            {/* Other User Info */}
            {data.otherUser && (
              <div className="flex items-center gap-x-3 flex-1">
                {/* Avatar */}
                {data.otherUser.avatar_url ? (
                  <img
                    src={data.otherUser.avatar_url}
                    alt={data.otherUser.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="font-semibold">
                      {data.otherUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <h2 className="font-semibold">{data.otherUser.username}</h2>
                  <p className="text-xs text-muted-foreground">
                    Active on 10xR
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages
            roomId={params.roomId}
            initialMessages={data.messages}
            currentUserId={userProfile.id}
          />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <ChatInput roomId={params.roomId} />
        </div>
      </Card>
    </div>
  );
}
