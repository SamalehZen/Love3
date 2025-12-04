import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@lib/supabase';
import type { ConnectionRequest, Profile } from '@types';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { useConversations } from './ConversationsContext';

interface RequestsContextValue {
  sentRequests: ConnectionRequest[];
  receivedRequests: ConnectionRequest[];
  loading: boolean;
  pendingCount: number;
  lastAcceptedConversationId: string | null;
  acknowledgeAcceptedConversation: () => void;
  refreshRequests: () => Promise<void>;
  sendRequest: (userId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
}

const RequestsContext = createContext<RequestsContextValue | undefined>(undefined);

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

export const RequestsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { success, error: errorToast, info } = useNotification();
  const { openConversationWithUser, selectConversation } = useConversations();

  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastAcceptedConversationId, setLastAcceptedConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSentRequests([]);
      setReceivedRequests([]);
    }
  }, [user]);

  const fetchRequests = useCallback(async () => {
    if (!user) {
      setSentRequests([]);
      setReceivedRequests([]);
      return;
    }
    setLoading(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        supabase
          .from('connection_requests')
          .select(
            `*,
            from_user:profiles!connection_requests_from_user_id_fkey(*),
            to_user:profiles!connection_requests_to_user_id_fkey(*)`
          )
          .eq('from_user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('connection_requests')
          .select(
            `*,
            from_user:profiles!connection_requests_from_user_id_fkey(*),
            to_user:profiles!connection_requests_to_user_id_fkey(*)`
          )
          .eq('to_user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (sentRes.error) {
        console.error(sentRes.error);
      } else {
        setSentRequests(
          (sentRes.data ?? []).map((req) => ({
            id: req.id,
            from_user_id: req.from_user_id,
            to_user_id: req.to_user_id,
            status: req.status,
            created_at: req.created_at,
            from_user: req.from_user ? mapProfile(req.from_user) : undefined,
            to_user: req.to_user ? mapProfile(req.to_user) : undefined,
          }))
        );
      }

      if (receivedRes.error) {
        console.error(receivedRes.error);
      } else {
        setReceivedRequests(
          (receivedRes.data ?? []).map((req) => ({
            id: req.id,
            from_user_id: req.from_user_id,
            to_user_id: req.to_user_id,
            status: req.status,
            created_at: req.created_at,
            from_user: req.from_user ? mapProfile(req.from_user) : undefined,
            to_user: req.to_user ? mapProfile(req.to_user) : undefined,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchRequests();

    const channel = supabase
      .channel(`requests-${user.id}`)
      .on('postgres_changes', { schema: 'public', table: 'connection_requests', event: '*' }, async (payload) => {
        const record = (payload.new ?? payload.old) as ConnectionRequest & {
          from_user_id: string;
          to_user_id: string;
        };
        if (!record) return;
        if (record.from_user_id === user.id || record.to_user_id === user.id) {
          await fetchRequests();
          if (payload.eventType === 'INSERT' && record.to_user_id === user.id) {
            info('Nouvelle demande reçue');
          }
          if (
            payload.eventType === 'UPDATE' &&
            record.status === 'accepted' &&
            record.from_user_id === user.id
          ) {
            const partnerId = record.to_user_id;
            const conversation = await openConversationWithUser(partnerId);
            if (conversation) {
              selectConversation(conversation.id);
              setLastAcceptedConversationId(conversation.id);
              success('Votre demande a été acceptée ✨');
            }
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests, info, openConversationWithUser, selectConversation, success, user]);

  const sendRequest = useCallback(
    async (targetUserId: string) => {
      if (!user) {
        errorToast('Vous devez être connecté.');
        return;
      }
      const { error } = await supabase.from('connection_requests').insert({
        from_user_id: user.id,
        to_user_id: targetUserId,
      });
      if (error) {
        if (error.code === '23505') {
          info('Demande déjà envoyée.');
          return;
        }
        errorToast('Impossible d’envoyer la demande.');
        console.error(error);
        return;
      }
      success('Demande envoyée ✅');
      fetchRequests();
    },
    [errorToast, fetchRequests, info, success, user]
  );

  const handleAcceptanceSideEffects = useCallback(
    async (request: ConnectionRequest) => {
      const partnerId = request.from_user_id === user?.id ? request.to_user_id : request.from_user_id;
      if (!partnerId) return;
      try {
        const conversation = await openConversationWithUser(partnerId);
        if (conversation) {
          selectConversation(conversation.id);
          setLastAcceptedConversationId(conversation.id);
        }
      } catch (err) {
        console.error('Failed to open conversation after acceptance', err);
      }
    },
    [openConversationWithUser, selectConversation, user?.id]
  );

  const acceptRequest = useCallback(
    async (requestId: string) => {
      const { data, error } = await supabase
        .from('connection_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .select('*')
        .single();

      if (error) {
        errorToast('Impossible d’accepter la demande.');
        console.error(error);
        return;
      }

      success('Connexion acceptée');
      await handleAcceptanceSideEffects(data as ConnectionRequest);
      fetchRequests();
    },
    [errorToast, fetchRequests, handleAcceptanceSideEffects, success]
  );

  const rejectRequest = useCallback(
    async (requestId: string) => {
      const { error } = await supabase
        .from('connection_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) {
        errorToast('Impossible de refuser la demande.');
        console.error(error);
        return;
      }
      info('Demande refusée');
      fetchRequests();
    },
    [errorToast, fetchRequests, info]
  );

  const pendingCount = useMemo(
    () => receivedRequests.filter((req) => req.status === 'pending').length,
    [receivedRequests]
  );

  const acknowledgeAcceptedConversation = useCallback(() => {
    setLastAcceptedConversationId(null);
  }, []);

  const value = useMemo(
    () => ({
      sentRequests,
      receivedRequests,
      loading,
      pendingCount,
      lastAcceptedConversationId,
      acknowledgeAcceptedConversation,
      refreshRequests: fetchRequests,
      sendRequest,
      acceptRequest,
      rejectRequest,
    }),
    [
      sentRequests,
      receivedRequests,
      loading,
      pendingCount,
      lastAcceptedConversationId,
      acknowledgeAcceptedConversation,
      fetchRequests,
      sendRequest,
      acceptRequest,
      rejectRequest,
    ]
  );

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
};

export const useRequests = () => {
  const ctx = useContext(RequestsContext);
  if (!ctx) {
    throw new Error('useRequests must be used within RequestsProvider');
  }
  return ctx;
};
