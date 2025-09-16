import { GoogleGenAI, Type } from "@google/genai";
import type { GeminiGeneratedData } from '../types';

// Lazily initialize the AI client to prevent app crash on load
let ai: GoogleGenAI | null = null;
const getAiClient = () => {
    if (!ai) {
        // Access the API key using Vite's import.meta.env object
        const apiKey = import.meta.env.VITE_API_KEY;
        if (!apiKey) {
            // This error will now only be thrown when a user tries to save a new place, not on page load.
            throw new Error("API_KEY is not configured. Please set it up in your environment variables to add new places.");
        }
        ai = new GoogleGenAI({ apiKey: apiKey });
    }
    return ai;
};

const basicPlaceSchema = {
  type: Type.OBJECT,
  properties: {
    placeExists: {
      type: Type.BOOLEAN,
      description: "Is this a real, known geographical place? If not, this should be false.",
    },
    countryName: {
      type: Type.STRING,
      description: "The full name of the country this place is in. Should be empty string if place does not exist.",
    },
    countryCode: {
      type: Type.STRING,
      description: "The two-letter ISO 3166-1 alpha-2 code for the country. Should be empty string if place does not exist.",
    },
  },
  required: ["placeExists", "countryName", "countryCode"],
};


const detailedPlaceSchema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "A short, one-sentence reason why this place is famous or what it is known for.",
    },
    latitude: {
        type: Type.NUMBER,
        description: "The geographical latitude of the place."
    },
    longitude: {
        type: Type.NUMBER,
        description: "The geographical longitude of the place."
    },
    detailedInfo: {
        type: Type.OBJECT,
        description: "Detailed travel guide information.",
        properties: {
            whyFamous: {
                type: Type.STRING,
                description: "A paragraph explaining why this place is famous from a tourist and exploration point of view."
            },
            thingsToDo: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of 3-5 famous or best things to do at this location."
            },
            nearbyAttractions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of 2-3 famous attractions or places to visit nearby."
            },
            bestTimeToVisit: {
                type: Type.STRING,
                description: "A short suggestion on the best time (season or months) to visit."
            },
            estimatedBudget: {
                type: Type.STRING,
                description: "A rough estimate of the daily budget for a solo traveler (e.g., '$100-150 USD per day'). Include currency."
            },
            flightsInfo: {
                type: Type.STRING,
                description: "Information about reaching the destination, like the nearest major international airport (IATA code and name)."
            }
        },
        required: ["whyFamous", "thingsToDo", "nearbyAttractions", "bestTimeToVisit", "estimatedBudget", "flightsInfo"]
    },
    tags: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of 3-5 relevant tags for this place (e.g., 'Nature', 'History', 'Adventure', 'Foodie', 'Hidden Gem', 'Beach', 'Mountain')."
    }
  },
  required: ["description", "latitude", "longitude", "detailedInfo", "tags"],
};

export const getBasicPlaceInfo = async (placeName: string): Promise<{ countryName: string; countryCode: string; placeExists: boolean; } | null> => {
  try {
    const gemini = getAiClient();
    const prompt = `Provide only the basic geographical information for the following place: "${placeName}". If you cannot identify it, mark 'placeExists' as false.`;
    
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: basicPlaceSchema,
      },
    });
    
    return JSON.parse(response.text.trim());

  } catch (error) {
    console.error("Error calling Gemini API for basic info:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) {
        throw error;
    }
    throw new Error("Could not fetch basic place information from AI.");
  }
};

export const getDetailedPlaceInfo = async (placeName: string): Promise<Omit<GeminiGeneratedData, 'countryName' | 'countryCode' | 'placeExists'> | null> => {
  try {
    const gemini = getAiClient();
    const prompt = `You are a world-class travel agent and geographer. Analyze the following place name and provide its coordinates, a comprehensive travel guide, and relevant tags. Place: "${placeName}"`;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: detailedPlaceSchema,
      },
    });

    return JSON.parse(response.text.trim());

  } catch (error) {
    console.error("Error calling Gemini API for detailed info:", error);
    throw new Error("Could not fetch detailed place information from AI.");
  }
};
