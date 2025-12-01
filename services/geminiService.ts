import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// Helper to safely access environment variables in browser across different build tools
const getEnvVar = (key: string): string | undefined => {
  // 1. Check standard process.env (Node/Webpack/Next.js/CRA)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || 
           process.env[`NEXT_PUBLIC_${key}`] || 
           process.env[`VITE_${key}`] || 
           process.env[`REACT_APP_${key}`];
  }
  
  // 2. Check Vite's import.meta.env
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key] || import.meta.env[`VITE_${key}`];
  }
  
  return undefined;
};

// Helper to get the AI client lazily.
const getAIClient = () => {
  const apiKey = getEnvVar('API_KEY');
  
  if (!apiKey) {
    console.warn("Gemini API Key missing! Check your Vercel Environment Variables. Use VITE_API_KEY or NEXT_PUBLIC_API_KEY.");
  }
  
  // Return client with key (or empty string to avoid immediate crash, though calls will fail)
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

/**
 * Generates a thoughtful chat response using the high-reasoning model.
 * Model: gemini-3-pro-preview
 */
export const generateChatResponse = async (history: Message[], userMessage: string): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // We construct a simple prompt history.
    const systemPrompt = `You are "Connexa AI", a helpful, witty, and charming dating coach and assistant living inside a dating app. 
    Your goal is to help the user improve their profile, suggest conversation starters, and just be a fun companion.
    Keep responses concise (under 3 sentences usually) and conversational. Use emojis sparingly but effectively.`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents as any, 
      config: {
        thinkingConfig: { thinkingBudget: 1024 } // Enable some thinking for better advice
      }
    });

    return response.text || "I'm having trouble connecting to the love cloud right now. Try again?";
  } catch (error) {
    console.error("Chat generation error:", error);
    return "Oops, my wires got crossed. Can you check your connection or API Key?";
  }
};

/**
 * Generates a fast, witty reply suggestion using the lightweight model.
 * Model: gemini-flash-lite-latest (for "gemini-2.5-flash-lite")
 */
export const generateFastWittyReply = async (context: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', 
      contents: `Generate a single, short, witty, and flirtatious reply to this message: "${context}". Do not include quotes. Max 15 words.`,
    });

    return response.text || "Tell me more!";
  } catch (error) {
    console.error("Fast response error:", error);
    return "That's interesting!";
  }
};