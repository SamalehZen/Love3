import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Bolt } from 'lucide-react';
import { Message } from '../types';
import { generateChatResponse, generateFastWittyReply } from '../services/geminiService';

export const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hey! I'm Connexa AI. Need a catchy opener or profile advice? I'm here to help you win the dating game! 😉",
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Detect System Theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }
  }, []);

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

  // Theme Colors
  const theme = {
      bg: isDarkMode ? 'bg-background' : 'bg-[#F2F2F7]',
      headerBorder: isDarkMode ? 'border-white/5' : 'border-gray-200',
      textMain: isDarkMode ? 'text-white' : 'text-gray-900',
      textSub: isDarkMode ? 'text-gray-400' : 'text-gray-500',
      userBubble: 'bg-[#FF6B3C] text-white', // Primary Orange
      aiBubble: isDarkMode ? 'bg-surface border border-white/5 text-gray-200' : 'bg-white border border-gray-200 text-gray-800 shadow-sm',
      inputBg: isDarkMode ? 'bg-surface' : 'bg-white',
      inputBorder: isDarkMode ? 'border-white/10' : 'border-gray-200',
      typingDot: isDarkMode ? 'bg-gray-500' : 'bg-gray-400',
      suggestionBg: isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm',
      suggestionText: isDarkMode ? 'text-gray-300' : 'text-gray-700',
  };

  return (
    <div className={`flex flex-col h-full pt-4 pb-24 transition-colors duration-500 ${theme.bg}`}>
      {/* Header */}
      <div className={`px-6 pb-4 border-b flex items-center justify-between ${theme.headerBorder}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-action-purple to-blue-500 flex items-center justify-center shadow-md">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h2 className={`font-semibold ${theme.textMain}`}>Connexa AI</h2>
            <div className="flex items-center gap-1.5">
               <span className="w-2 h-2 bg-action-green rounded-full animate-pulse"></span>
               <span className={`text-xs ${theme.textSub}`}>Online</span>
            </div>
          </div>
        </div>
        <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-surface hover:bg-white/5 border-white/10' : 'bg-white hover:bg-gray-50 border-gray-200 shadow-sm'} border`}>
          <Sparkles className="text-[#FF6B3C]" size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                isUser 
                  ? `${theme.userBubble} rounded-tr-none` 
                  : `${theme.aiBubble} rounded-tl-none`
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] opacity-60 mt-1 text-right ${isUser ? 'text-white' : theme.textSub}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className={`rounded-2xl rounded-tl-none px-4 py-3 ${theme.aiBubble}`}>
              <div className="flex gap-1">
                <span className={`w-2 h-2 rounded-full animate-bounce ${theme.typingDot}`}></span>
                <span className={`w-2 h-2 rounded-full animate-bounce delay-100 ${theme.typingDot}`}></span>
                <span className={`w-2 h-2 rounded-full animate-bounce delay-200 ${theme.typingDot}`}></span>
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
                className="flex items-center gap-2 bg-action-purple/10 border border-action-purple/30 text-action-purple px-3 py-1.5 rounded-full text-xs whitespace-nowrap hover:bg-action-purple/20 transition-colors"
            >
                <Bolt size={12} />
                Generate Witty Reply
            </button>
             <button 
                onClick={() => setInput("How do I improve my bio?")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors border ${theme.suggestionBg} ${theme.suggestionText}`}
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
            className={`flex-1 rounded-full pl-5 pr-12 py-3.5 border focus:outline-none focus:border-[#FF6B3C]/50 text-sm transition-colors ${theme.inputBg} ${theme.textMain} ${theme.inputBorder} placeholder-gray-400`}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 p-2 bg-[#FF6B3C] rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};