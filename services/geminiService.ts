import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const getApiKey = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_KEY || 
           import.meta.env.VITE_GEMINI_API_KEY || 
           (import.meta.env.MODE === 'development' ? '' : '');
  }
  
  if (typeof process !== 'undefined' && process.env) {
    return process.env.API_KEY || 
           process.env.VITE_API_KEY ||
           process.env.GEMINI_API_KEY || 
           '';
  }
  
  return '';
};

let aiClient: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (!aiClient) {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      console.warn("Gemini API Key missing! Set VITE_API_KEY in your environment variables.");
    }
    
    aiClient = new GoogleGenAI({ apiKey: apiKey || 'demo-key' });
  }
  
  return aiClient;
};

export const generateChatResponse = async (history: Message[], userMessage: string): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const systemPrompt = `You are "Overlay AI", a helpful, witty, and charming dating coach and assistant living inside a dating app. 
    Your goal is to help the user improve their profile, suggest conversation starters, and just be a fun companion.
    Keep responses concise (under 3 sentences usually) and conversational. Use emojis sparingly but effectively.
    Respond in the same language as the user's message.`;

    const contents = [
      { role: 'user' as const, parts: [{ text: systemPrompt }] },
      ...history.map(msg => ({
        role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user' as const, parts: [{ text: userMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
    });

    return response.text || "I'm having trouble connecting to the love cloud right now. Try again?";
  } catch (error) {
    console.error("Chat generation error:", error);
    return "Oops, my wires got crossed. Can you check your connection or API Key?";
  }
};

export const generateFastWittyReply = async (context: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Generate a single, short, witty, and flirtatious reply to this message: "${context}". Do not include quotes. Max 15 words.`,
    });

    return response.text || "Tell me more!";
  } catch (error) {
    console.error("Fast response error:", error);
    return "That's interesting!";
  }
};
