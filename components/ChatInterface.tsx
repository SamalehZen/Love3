import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Bolt } from 'lucide-react';
import { Message } from '../types';
import { generateChatResponse, generateFastWittyReply } from '../services/geminiService';

export const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hey! I'm Connexa AI. Need a catchy opener or profile advice? I'm here to help you win the dating game! 😉",
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call Gemini Service
    const aiResponseText = await generateChatResponse(messages, userMsg.text);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: aiResponseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleFastIcebreaker = async () => {
    setIsTyping(true);
    // Simulating context from a hypothetical match or previous user msg
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.text || "Hi there";
    
    const wittyReply = await generateFastWittyReply(lastUserMsg);
    
    // We put this in the input box for the user to send
    setInput(wittyReply);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-background pt-4 pb-24">
      {/* Header */}
      <div className="px-6 pb-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-action-purple to-blue-500 flex items-center justify-center">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-white font-semibold">Connexa AI</h2>
            <div className="flex items-center gap-1.5">
               <span className="w-2 h-2 bg-action-green rounded-full animate-pulse"></span>
               <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
          <Sparkles className="text-primary-orange" size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                isUser 
                  ? 'bg-primary-red text-white rounded-tr-none' 
                  : 'bg-surface border border-white/5 text-gray-200 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className="text-[10px] opacity-50 mt-1 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface border border-white/5 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Actions & Input */}
      <div className="px-4">
         {/* Fast Action Suggestion */}
        <div className="mb-2 flex gap-2 overflow-x-auto no-scrollbar">
            <button 
                onClick={handleFastIcebreaker}
                className="flex items-center gap-2 bg-action-purple/20 border border-action-purple/50 text-action-purple px-3 py-1.5 rounded-full text-xs whitespace-nowrap hover:bg-action-purple/30 transition-colors"
            >
                <Bolt size={12} />
                Generate Witty Reply
            </button>
             <button 
                onClick={() => setInput("How do I improve my bio?")}
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-full text-xs whitespace-nowrap hover:bg-white/10 transition-colors"
            >
                <User size={12} />
                Bio Help
            </button>
        </div>

        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-surface text-white rounded-full pl-5 pr-12 py-3.5 border border-white/10 focus:outline-none focus:border-primary-orange/50 placeholder-gray-500 text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 p-2 bg-primary-red rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};