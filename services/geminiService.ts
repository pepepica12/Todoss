
import { GoogleGenAI } from "@google/genai";
import { SearchResult, SearchFocus, GroundingSource } from "../types";

/**
 * Configuration for the search engine's specialized behaviors.
 */
const FOCUS_STRATEGIES = {
  [SearchFocus.GENERAL]: {
    model: "gemini-3-flash-preview",
    persona: "Helpful Generalist",
    instruction: "Provide a clear, high-level summary. Use simple analogies for complex topics.",
    fewShot: `
      User: "What is the capital of France and its history?"
      Assistant: **Paris** is the capital. It was founded in the 3rd century BC... [History overview]
      Sources: [Link 1, Link 2]
    `
  },
  [SearchFocus.NEWS]: {
    model: "gemini-3-flash-preview",
    persona: "Real-time News Anchor",
    instruction: "Prioritize the latest developments from the last 24-48 hours. Focus on verified facts and timelines.",
    fewShot: `
      User: "What happened in the stock market today?"
      Assistant: The market closed higher today with the S&P 500 rising 1.2%... [Key movers]
      Sources: [Reuters, Bloomberg]
    `
  },
  [SearchFocus.ACADEMIC]: {
    model: "gemini-3-pro-preview",
    persona: "Research Scientist",
    instruction: "Use formal, academic language. Cite specific studies, peer-reviewed journals, and university research. Discuss methodologies and research gaps where applicable.",
    fewShot: `
      User: "Efficacy of mRNA vaccines in long-term studies"
      Assistant: Longitudinal analysis of mRNA-1273 cohorts indicates sustained neutralizing antibody titers... [Scientific breakdown]
      Sources: [Nature, The Lancet, NIH]
    `
  },
  [SearchFocus.TECHNICAL]: {
    model: "gemini-3-pro-preview",
    persona: "Senior Software Architect",
    instruction: "Focus on best practices, performance, and security. Provide clean, well-commented code examples using modern standards.",
    fewShot: `
      User: "How to implement a custom hook for debouncing in React?"
      Assistant: To optimize performance, use a custom hook that wraps setTimeout... 
      \`\`\`typescript
      const useDebounce = (value, delay) => { ... }
      \`\`\`
      Sources: [React.dev, MDN]
    `
  }
};

export const performSearch = async (
  query: string,
  focus: SearchFocus = SearchFocus.GENERAL
): Promise<SearchResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured.");
  }

  const strategy = FOCUS_STRATEGIES[focus];
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    Persona: You are a ${strategy.persona}.
    Instructions: ${strategy.instruction}
    
    Guidelines:
    1. ALWAYS use the Google Search tool for grounding.
    2. Format output in Markdown. Use bold headers, bullet points, and tables where appropriate.
    3. Include citations as clear links at the end of the response.
    4. If information is unavailable or contradictory, state so clearly.
    
    Example Behavior:
    ${strategy.fewShot}
  `;

  try {
    const response = await ai.models.generateContent({
      model: strategy.model,
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction,
        temperature: 0.2,
      },
    });

    const answer = response.text || "No results found.";
    
    // Extract grounding sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || "External Reference",
        uri: chunk.web.uri,
      }));

    // Deduplicate sources
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
    console.error("Search Logic Error:", error);
    throw new Error(error instanceof Error ? error.message : "Search operation failed.");
  }
};
