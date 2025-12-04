import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@lib/supabase';
import type { Conversation, Message, Profile } from '@types';
import { useAuth } from './AuthContext';

interface ConversationsContextValue {
  conversations: Conversation[];
  loading: boolean;
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  selectConversation: (conversationId: string | null) => void;
  refreshConversations: () => Promise<Conversation[]>;
  openConversationWithUser: (userId: string) => Promise<Conversation | null>;
}

const ConversationsContext = createContext<ConversationsContextValue | undefined>(undefined);

const mapProfile = (row: any): Profile => ({
  id: row.id,
  name: row.name,
  age: row.age,
  bio: row.bio,
  photo_url: row.photo_url,
  interests: row.interests ?? [],
  gender: row.gender,
  looking_for: row.looking_for,
  location: row.location?.coordinates
    ? { lat: row.location.coordinates[1], lng: row.location.coordinates[0] }
    : null,
  is_online: row.is_online,
  last_seen: row.last_seen,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const ConversationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestConversationsRef = useRef<Conversation[]>([]);

  const refreshConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      latestConversationsRef.current = [];
      setCurrentConversationId(null);
      return [];
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(
          `*,
          user1:profiles!conversations_user1_id_fkey(*),
          user2:profiles!conversations_user2_id_fkey(*)`
        )
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch conversations', error);
        return latestConversationsRef.current;
      }

      const ids = data?.map((conv) => conv.id) ?? [];
      let lastMessageMap = new Map<string, Message>();
      let unreadCountMap = new Map<string, number>();

      if (ids.length) {
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', ids)
          .order('created_at', { ascending: false });

        messagesData?.forEach((msg) => {
          if (!lastMessageMap.has(msg.conversation_id)) {
            lastMessageMap.set(msg.conversation_id, msg as Message);
          }
          if (msg.sender_id !== user.id && !msg.is_read) {
            unreadCountMap.set(
              msg.conversation_id,
              (unreadCountMap.get(msg.conversation_id) ?? 0) + 1
            );
          }
        });
      }

      const normalized = (data ?? []).map((conv) => {
        const participants: Profile[] = [];
        if (conv.user1) participants.push(mapProfile(conv.user1));
        if (conv.user2) participants.push(mapProfile(conv.user2));
        return {
          id: conv.id,
          user1_id: conv.user1_id,
          user2_id: conv.user2_id,
          user1_matched: conv.user1_matched,
          user2_matched: conv.user2_matched,
          place_match_id: conv.place_match_id,
          place_match_name: conv.place_match_name,
          place_match_at: conv.place_match_at,
          places_list: conv.places_list ?? null,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          participants,
          last_message: lastMessageMap.get(conv.id) ?? null,
          unread_count: unreadCountMap.get(conv.id) ?? 0,
        } satisfies Conversation;
      });

      setConversations(normalized);
      latestConversationsRef.current = normalized;
      return normalized;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      refreshConversations();
    }, 250);
  }, [refreshConversations]);

  useEffect(() => {
    if (!user) return;
    refreshConversations();

    const channel = supabase
      .channel(`conversations-${user.id}`)
      .on(
        'postgres_changes',
        { schema: 'public', table: 'conversations', event: '*' },
        (payload) => {
          const record = (payload.new ?? payload.old) as { user1_id: string; user2_id: string } | null;
          if (!record) return;
          if (record.user1_id === user.id || record.user2_id === user.id) {
            scheduleRefresh();
          }
        }
      )
      .on(
        'postgres_changes',
        { schema: 'public', table: 'messages', event: '*' },
        (payload) => {
          const record = (payload.new ?? payload.old) as Message | null;
          if (!record) return;
          scheduleRefresh();
        }
      )
      .subscribe();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [scheduleRefresh, user, refreshConversations]);

  const selectConversation = useCallback((conversationId: string | null) => {
    setCurrentConversationId(conversationId);
  }, []);

  const openConversationWithUser = useCallback(
    async (otherUserId: string) => {
      if (!user) return null;
      const [user1_id, user2_id] = [user.id, otherUserId].sort();

      const { data, error } = await supabase
        .from('conversations')
        .upsert({ user1_id, user2_id }, { onConflict: 'user1_id,user2_id' })
        .select('*')
        .single();

      if (error) {
        console.error('Unable to open conversation', error);
        throw error;
      }

      const updated = await refreshConversations();
      const match = updated.find((conv) => conv.id === data.id) ?? null;
      if (match) {
        setCurrentConversationId(match.id);
      }
      return match;
    },
    [refreshConversations, user]
  );

  const currentConversation = useMemo(
    () => conversations.find((conv) => conv.id === currentConversationId) ?? null,
    [conversations, currentConversationId]
  );

  const value = useMemo(
    () => ({
      conversations,
      loading,
      currentConversationId,
      currentConversation,
      selectConversation,
      refreshConversations,
      openConversationWithUser,
    }),
    [
      conversations,
      loading,
      currentConversationId,
      currentConversation,
      selectConversation,
      refreshConversations,
      openConversationWithUser,
    ]
  );

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
};

export const useConversations = () => {
  const ctx = useContext(ConversationsContext);
  if (!ctx) {
    throw new Error('useConversations must be used within ConversationsProvider');
  }
  return ctx;
};
