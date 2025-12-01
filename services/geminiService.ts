import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// Helper to get the AI client lazily.
// This prevents the app from crashing on startup if process is undefined in the browser.
const getAIClient = () => {
  // Ensure process.env.API_KEY is available or handle gracefully
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  if (!apiKey) {
    console.warn("API Key not found. Chat features may not work.");
  }
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
    return "Oops, my wires got crossed. Can you say that again?";
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
      model: 'gemini-flash-lite-latest', // Mapped from "gemini-2.5-flash-lite" as per guidelines
      contents: `Generate a single, short, witty, and flirtatious reply to this message: "${context}". Do not include quotes. Max 15 words.`,
    });

    return response.text || "Tell me more!";
  } catch (error) {
    console.error("Fast response error:", error);
    return "That's interesting!";
  }
};