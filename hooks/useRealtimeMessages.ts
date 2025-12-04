import { useEffect } from 'react';
import { supabase } from '@lib/supabase';
import type { Message } from '@types';

interface UseRealtimeMessagesOptions {
  onInsert?: (message: Message) => void;
  onUpdate?: (message: Message) => void;
}

export const useRealtimeMessages = (
  conversationId: string | null,
  { onInsert, onUpdate }: UseRealtimeMessagesOptions = {}
) => {
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        { schema: 'public', table: 'messages', event: '*', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const record = payload.new as Message;
          if (payload.eventType === 'INSERT') {
            onInsert?.(record);
          }
          if (payload.eventType === 'UPDATE') {
            onUpdate?.(record);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, onInsert, onUpdate]);
};
