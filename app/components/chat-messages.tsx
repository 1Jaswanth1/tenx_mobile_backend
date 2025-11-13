/**
 * Chat Messages Component
 *
 * Displays message history with real-time updates via Supabase Realtime.
 * Auto-scrolls to bottom when new messages arrive.
 *
 * Features:
 * - Real-time message updates
 * - Chat bubble UI with avatars
 * - Timestamp formatting
 * - Auto-scroll behavior
 * - Grouped by sender
 *
 * Stack:
 * - Next.js Client Component
 * - Supabase Realtime
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Message type from database
 */
type Message = {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  users: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
};

/**
 * ChatMessages Component Props
 */
interface ChatMessagesProps {
  roomId: string;
  initialMessages: Message[];
  currentUserId: string;
}

/**
 * ChatMessages Component
 *
 * Displays messages with real-time updates.
 */
export default function ChatMessages({
  roomId,
  initialMessages,
  currentUserId,
}: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // ============================================================================
  // Real-time Subscription
  // ============================================================================
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message',
          filter: `chat_room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch the full message with user data
          const { data: newMessage } = await supabase
            .from('message')
            .select(
              `
              id,
              text,
              created_at,
              author_id,
              users!message_author_id_fkey (
                id,
                username,
                avatar_url
              )
            `
            )
            .eq('id', payload.new.id)
            .single();

          if (newMessage) {
            setMessages((prev) => [...prev, newMessage as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, supabase]);

  // ============================================================================
  // Auto-scroll to Bottom
  // ============================================================================
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ============================================================================
  // Format Timestamp
  // ============================================================================
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Today - show time
    if (diffDays < 1) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    // Yesterday
    if (diffDays === 1) {
      return 'Yesterday';
    }

    // This week - show day name
    if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    // Older - show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const isCurrentUser = message.author_id === currentUserId;
          const showAvatar =
            index === 0 ||
            messages[index - 1].author_id !== message.author_id;

          return (
            <div
              key={message.id}
              className={`flex gap-x-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {showAvatar ? (
                  message.users.avatar_url ? (
                    <img
                      src={message.users.avatar_url}
                      alt={message.users.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {message.users.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )
                ) : (
                  <div className="w-8 h-8" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                {/* Username (only show if different from previous message) */}
                {showAvatar && (
                  <span className="text-xs text-muted-foreground mb-1 px-1">
                    {isCurrentUser ? 'You' : message.users.username}
                  </span>
                )}

                {/* Message Content */}
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[500px] break-words ${
                    isCurrentUser
                      ? 'bg-brand-orange text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-muted-foreground mt-1 px-1">
                  {formatTime(message.created_at)}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
