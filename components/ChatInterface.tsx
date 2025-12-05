import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Heart, MapPin, Send, CheckCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { useConversations } from '@contexts/ConversationsContext';
import { useNotification } from '@contexts/NotificationContext';
import { useRealtimeMessages } from '@hooks/useRealtimeMessages';
import { supabase } from '@lib/supabase';
import type { Message } from '@types';
import { MatchAnimation } from './MatchAnimation';

interface ChatInterfaceProps {
  onBack?: () => void;
  onOpenPlaces: () => void;
}

interface SystemMessageContent {
  type: 'system';
  subtype: 'place_match';
  place: {
    name: string;
    address?: string;
  };
}

const parseSystemMessage = (content: string): SystemMessageContent | null => {
  try {
    const data = JSON.parse(content);
    if (data?.type === 'system') {
      return data as SystemMessageContent;
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack, onOpenPlaces }) => {
  const { user, profile: currentProfile } = useAuth();
  const { theme } = useTheme();
  const { currentConversation } = useConversations();
  const { success, error } = useNotification();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const partner = useMemo(
    () => currentConversation?.participants?.find((p) => p.id !== user?.id) ?? null,
    [currentConversation?.participants, user?.id]
  );

  const bothMatched = Boolean(currentConversation?.user1_matched && currentConversation?.user2_matched);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const markAsRead = useCallback(async () => {
    if (!currentConversation || !user) return;
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', currentConversation.id)
        .neq('sender_id', user.id);
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  }, [currentConversation, user]);

  useEffect(() => {
    if (!currentConversation) {
      setMessages([]);
      return;
    }
    setLoading(true);
    const loadMessages = async () => {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversation.id)
        .order('created_at', { ascending: true });
      if (fetchError) {
        console.error(fetchError);
        error('Impossible de charger les messages');
      } else {
        setMessages(data as Message[]);
        markAsRead();
      }
      setLoading(false);
      scrollToBottom();
    };

    loadMessages();
  }, [currentConversation, error, markAsRead, scrollToBottom]);

  useRealtimeMessages(currentConversation?.id ?? null, {
    onInsert: (message) => {
      setMessages((prev) => [...prev, message]);
      if (message.sender_id !== user?.id) {
        markAsRead();
      }
      scrollToBottom();
    },
    onUpdate: (message) => {
      setMessages((prev) => prev.map((msg) => (msg.id === message.id ? message : msg)));
    },
  });

  useEffect(() => {
    if (bothMatched) {
      setShowMatchAnimation(true);
    }
  }, [bothMatched]);

  const handleSend = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!input.trim() || !currentConversation || !user) return;
    setSending(true);
    try {
      await supabase.from('messages').insert({
        conversation_id: currentConversation.id,
        sender_id: user.id,
        content: input.trim(),
      });
      setInput('');
      scrollToBottom();
    } catch (err) {
      error('Envoi impossible');
    } finally {
      setSending(false);
    }
  };

  const handleMatchClick = async () => {
    if (!currentConversation || !user) return;
    const field = currentConversation.user1_id === user.id ? 'user1_matched' : 'user2_matched';
    const alreadyMatched = currentConversation.user1_id === user.id ? currentConversation.user1_matched : currentConversation.user2_matched;
    
    if (alreadyMatched) {
      onOpenPlaces();
      return;
    }
    
    try {
      await supabase.from('conversations').update({ [field]: true }).eq('id', currentConversation.id);
      success('Match envoyé');
    } catch (err) {
      error('Action impossible');
    }
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.sender_id === user?.id;
    const systemContent = parseSystemMessage(message.content);

    if (systemContent?.subtype === 'place_match') {
      return (
        <div key={message.id} className="w-full flex justify-center">
          <button
            className="px-4 py-2 rounded-2xl bg-action-green/10 text-action-green text-sm flex items-center gap-2"
            onClick={() => {
              const query = encodeURIComponent(systemContent.place.name + ' ' + (systemContent.place.address ?? ''));
              window.open(`https://maps.google.com/?q=${query}`, '_blank');
            }}
          >
            <MapPin size={14} /> 🎉 Match! Vous vous retrouvez à {systemContent.place.name}
          </button>
        </div>
      );
    }

    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[75%] rounded-3xl px-4 py-3 mb-2 ${
            isOwn ? 'bg-action-green text-black rounded-br-sm' : 'bg-white/5 text-white rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <div className="flex items-center gap-1 justify-end text-[10px] mt-1 opacity-70">
            <span>{new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            {isOwn && (
              <CheckCheck size={12} className={message.is_read ? 'text-black' : 'text-black/60'} />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Sélectionnez une conversation.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
        {onBack && (
          <button onClick={onBack} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
            <ArrowLeft />
          </button>
        )}
        <div className="flex items-center gap-4">
          <img
            src={partner?.photo_url ?? 'https://placehold.co/80x80?text=Chat'}
            alt={partner?.name}
            className="w-12 h-12 rounded-2xl object-cover"
          />
          <div>
            <h2 className={`text-lg font-semibold ${theme.textMain}`}>{partner?.name}</h2>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${partner?.is_online ? 'bg-action-green' : 'bg-gray-500'}`} />
              {partner?.is_online ? 'En ligne' : 'Hors ligne'}
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!bothMatched ? (
            <button
              onClick={handleMatchClick}
              disabled={currentConversation.user1_id === user?.id ? currentConversation.user1_matched : currentConversation.user2_matched}
              className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-colors ${
                (currentConversation.user1_id === user?.id ? currentConversation.user1_matched : currentConversation.user2_matched)
                  ? 'border-action-green/50 text-action-green/50 cursor-wait'
                  : 'border-white/10 text-white hover:border-action-green hover:text-action-green'
              }`}
            >
              <Heart className="fill-current" size={18} />
              {(currentConversation.user1_id === user?.id ? currentConversation.user1_matched : currentConversation.user2_matched)
                ? 'En attente...'
                : 'Match'}
            </button>
          ) : (
            <button
              onClick={onOpenPlaces}
              className="px-4 py-2 rounded-full border border-action-green bg-action-green text-black font-semibold flex items-center gap-2 hover:bg-action-green/90 transition-colors"
            >
              <MapPin size={18} /> Choisir un lieu
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="px-6 py-4 border-t border-white/5 flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrire un message"
          className="flex-1 rounded-full bg-white/5 border border-white/10 px-5 py-3 text-white focus:outline-none"
        />
        <button
          type="submit"
          className="w-12 h-12 rounded-full bg-action-green text-black flex items-center justify-center"
          disabled={sending || !input.trim()}
        >
          {sending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>

      {showMatchAnimation && partner && currentProfile && (
        <MatchAnimation
          profiles={[currentProfile, partner]}
          onClose={() => setShowMatchAnimation(false)}
          onMessage={() => {
            setShowMatchAnimation(false);
            onOpenPlaces();
          }}
        />
      )}
    </div>
  );
};
