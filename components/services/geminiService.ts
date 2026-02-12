
import { GoogleGenAI } from "@google/genai";
import { SearchResult, SearchFocus, GroundingSource } from "../types";

export const performSearch = async (
  query: string,
  focus: SearchFocus = SearchFocus.GENERAL
): Promise<SearchResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are an advanced search assistant. 
    Use the Google Search tool to provide accurate, up-to-date, and comprehensive answers.
    Focus: ${focus}.
    Provide a well-structured response in Markdown.
    If you find conflicting information, present both views.
    Always be concise but thorough.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction,
        temperature: 0.7,
      },
    });

    const answer = response.text || "No response generated.";
    
    // Extract grounding sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || "Untitled Source",
        uri: chunk.web.uri,
      }));

    // Deduplicate sources by URI
    const uniqueSources = sources.filter((source, index, self) =>
      index === self.findIndex((s) => s.uri === source.uri)
    );

    return {
      answer,
      sources: uniqueSources,
      query,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};
